import * as React from 'react';
import classNames from 'classnames';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import { Attachment } from '../../../common/types/graphql';
import { UploadableFile } from './UploadableFile';
import { styled } from '../style';

const FileDropZoneEl = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #777;
  outline: none;
  font-weight: normal;
  font-size: 80%;
  cursor: pointer;
  padding: 1px;

  &.over {
    border: 2px solid ${p => p.theme.focusColor};
    padding: 0;
    background-color: ${p => p.theme.cardBgColor};
  }

  span {
    pointer-events: none;
  }
`;

interface Props {
  fileList: Attachment[];
  env: ViewContext;
}

@observer
export class FileDropZone extends React.Component<Props> {
  @observable private isOver = false;
  @observable private canDrop = false;
  private fileInput: HTMLInputElement;

  public render() {
    const { fileList } = this.props;
    return (
      <FileDropZoneEl
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        htmlFor="upload"
        className={classNames('file-drop-zone', { over: this.isOver, canDrop: this.canDrop })}
      >
        {fileList.length === 0 && <span>Drop files here to upload (or click)</span>}
        <input
          type="file"
          id="upload"
          multiple={true}
          style={{ display: 'none' }}
          onChange={this.onFileChange}
          ref={el => { this.fileInput = el; }}
        />
      </FileDropZoneEl>
    );
  }

  @action.bound
  private onDragOver(e: React.DragEvent<HTMLLabelElement>) {
    for (const item of e.dataTransfer.items as any) {
      if (item.kind === 'file') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.isOver = true;
        break;
      }
    }
  }

  @action.bound
  private onDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.isOver = false;
  }

  @action.bound
  private onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    this.addFiles(e.dataTransfer.files);
  }

  @action.bound
  private onFileChange() {
    this.addFiles(this.fileInput.files);
    this.fileInput.value = '';
  }

  private addFiles(filesToAdd: FileList) {
    const { fileList, env } = this.props;
    for (const f of filesToAdd as any) {
      const index = fileList.findIndex(file => file.filename === f.name);
      if (index >= 0) {
        fileList[index] = new UploadableFile(env.project, f);
      } else {
        fileList.push(new UploadableFile(env.project, f));
      }
    }
  }
}
