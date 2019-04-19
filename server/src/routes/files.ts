import * as fs from 'fs';
import * as multer from 'multer';
import * as http from 'http';
import * as qs from 'qs';
import { URL } from 'url';
import { AccountRecord } from '../db/types';
import { handleAsyncErrors } from './errors';
import { logger } from '../logger';
import { server } from '../Server';
import { Role, Errors } from '../../../common/types/json';
import { getProjectAndRole } from '../db/role';
import { ObjectID } from 'mongodb';

function shouldCreateThumbnail(type: string) {
  if (!process.env.IMGPROC_URL) {
    return false;
  }
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      return true;
    default:
      return false;
  }
}

export const upload = multer({ dest: process.env.UPLOADS_DIR });

// Upload attachments.
server.app.post('/file/upload/:project', upload.single('attachment'), handleAsyncErrors(
  async (req, res) => {
    if (!req.user) {
      logger.error('upload file: not authenticated.');
      return res.status(401).end();
    }
    const user = req.user as AccountRecord;
    const { project }: { account: string; project: string } = req.params;
    const { project: projectRecord, role } = await getProjectAndRole(
      server.db, user, new ObjectID(project));
    const details = { user: user.accountName, project };
    const file: Express.Multer.File = req.file;

    if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error(`upload file: project ${project} not visible.`, details);
      } else {
        logger.error(`upload file: project ${project} not found.`, details);
      }
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    if (role < Role.REPORTER) {
      logger.error('upload file: user has insufficient privileges.', details);
      res.status(403).json({ error: Errors.FORBIDDEN });
      return;
    }

    logger.info(`Uploading file: "${file.originalname}" ${file.mimetype}`, details);

    if (shouldCreateThumbnail(file.mimetype)) {
      // Create two images: a full-sized one and a thumbnail.
      const url = new URL(process.env.IMGPROC_URL);
      logger.info(`ImgProc url: ${url.toString()}`);

      // Create an upload stream for the thumbnail.
      const wsThumb = server.bucket.openUploadStream(
        `${file.originalname}-thumb`, {
          contentType: req.file.mimetype,
          metadata: {
            project,
            creator: user._id.toHexString(),
            mark: true, // For garbage collection.
          },
        });
      const thumbId = wsThumb.id.toString();

      // Create a connection to the image processing service
      const thumbReq = http.request({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `/fit?${qs.stringify({ width: 90, height: 70 })}`,
        method: 'POST',
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
        }
      }, thumbRes => {
        // Open a write stream to the grid db for the thumbnail
        logger.info('creating write stream for thumbnail');

        // Pipe the output of the image processing service to the thumbnail.
        thumbRes.pipe(wsThumb, { end: true });
      });

      thumbReq.on('error', (e: any) => {
        logger.error(`error generating thumbnail: ${String(e)}`);
        logger.error(e);
        fs.unlink(file.path, () => {
          res.status(500).json({ err: 'upload' });
        });
      });

      thumbReq.on('finish', async () => {
        logger.info('creating write stream for full image');
        const wsFull = server.bucket.openUploadStream(
          req.file.originalname, {
            contentType: req.file.mimetype,
            metadata: {
              mark: true, // For garbage collection.
              project,
              creator: user._id.toHexString(),
              thumb: thumbId,
            },
          });
        const imageId = wsFull.id.toString();
        fs.createReadStream(file.path).pipe(wsFull);
        wsFull.on('error', (e: any) => {
          logger.error(e);
          fs.unlink(file.path, () => {
            res.status(500).json({ err: 'upload' });
          });
        });
        wsFull.on('finish', async () => {
          logger.info('File upload successful:', {
            name: file.originalname,
            type: file.mimetype,
            id: imageId,
            thumb: thumbId,
            ...details
          });
          // Delete the temp file.
          fs.unlink(file.path, () => {
            res.json({
              name: file.originalname,
              id: imageId,
              url: `/file/download/${imageId}`,
              thumb: `/file/download/${thumbId}`,
            });
          });
        });
      });

      // Pipe the image attachment to the image processing service.
      fs.createReadStream(file.path).pipe(thumbReq, { end: true });
    } else {
      // For non-image attachments.
      logger.info('creating write stream for non-image');
      const ws = server.bucket.openUploadStream(
        req.file.originalname, {
          contentType: req.file.mimetype,
          metadata: {
            project,
            creator: user._id.toHexString(),
            mark: true, // For garbage collection.
          },
        });
      const imageId = ws.id;
      fs.createReadStream(file.path).pipe(ws);
      ws.on('error', (e: any) => {
        logger.error(e);
        fs.unlink(file.path, () => {
          res.status(500).json({ err: 'upload' });
        });
      });
      ws.on('finish', async () => {
        // Delete the temp file.
        logger.info('File upload successful:', {
          name: file.originalname,
          type: file.mimetype,
          id: imageId,
          ...details
        });
        // const fileInfo = await server.bucket.getFilename(`${id}`);
        fs.unlink(file.path, () => {
          res.json({
            name: file.originalname,
            id: imageId,
            url: `/file/download/${imageId}`,
          });
        });
      });
    }
  }
));

server.app.get('/file/download/:id', async (req, res) => {
  const user = req.user as AccountRecord;
  const files = await server.bucket.find({ _id: new ObjectID(req.params.id) }).toArray();
  if (files.length === 0) {
    const details = {
      user: user ? user.accountName : null,
      id: req.params.id,
    };
    logger.error(`download file: ${req.params.id} not found.`, details);
    res.status(404).json({ error: Errors.NOT_FOUND });
    return;
  }

  const file = files[0];
  const { role } = await getProjectAndRole(server.db, user, new ObjectID(file.metadata.project));
  if (role < Role.VIEWER) {
    const details = {
      user: user ? user.accountName : null,
      filename: file.filename,
      project: file.metadata.project,
      id: req.params.id,
    };
    logger.error(`download file: project ${file.metadata.project} not found.`, details);
    res.status(404).json({ error: Errors.NOT_FOUND });
    return;
  }

  const rs = server.bucket.openDownloadStream(new ObjectID(req.params.id));
  res.set('Content-Type', file.metadata.contentType);
  res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
  rs.pipe(res);
});
