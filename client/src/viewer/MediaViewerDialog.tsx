import * as React from 'react';
import * as qs from 'qs';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { Dialog, Button } from 'skyhook-ui';
import ArrowBackIcon from '../svg-compiled/icons/IcArrowBack';
import ArrowForwardIcon from '../svg-compiled/icons/IcArrowForward';
import CloseIcon from '../svg-compiled/icons/IcClose';
import { MediaViewerModel } from './MediaViewerModel';
import { session } from '../models';
import { styled } from '../style';

const MediaViewerDialogEl = styled(Dialog)`
  background-color: #111;
  border: none;
  border-radius: 0;
  box-shadow: none;
  max-height: 100%;
  max-width: 100%;
  height: 100%;
  width: 100%;
`;

const MediaViewerHeader = styled(Dialog.Header)`
  padding: 4px;
  background-color: black;
  border-radius: 0;
`;

const HeaderButton = styled.button`
  align-items: center;
  border: none;
  border-radius: 2px;
  background-color: #222;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 0 4px;
  margin-left: 4px;
  height: 2rem;
  width: 2.5rem;
  outline: none;

  > svg {
    width: 24px;
    height: 24px;
    path {
      fill: #888;
    }
  }
`;

const MediaObjectName = styled.div`
  flex: 1;
  color: #888;
  padding: 0 8px;
`;

const MediaViewerBody = styled(Dialog.Body)`
  align-items: center;
  background-image:
    linear-gradient(45deg, #222 25%, transparent 25%),
    linear-gradient(-45deg, #222 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #222 75%),
    linear-gradient(-45deg, transparent 75%, #222 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 0;
}`;

const ImagePreview = styled.img`
  object-fit: contain;
`;

function withAuth(url: string) {
  if (session.isLoggedIn) {
    return `${url}${qs.stringify({ authorization: session.token }, { addQueryPrefix: true })}`;
  }
  return url;
}

interface Props {
  model: MediaViewerModel;
}

@observer
export class MediaViewerDialog extends React.Component<Props> {
  public render() {
    const { model } = this.props;
    const mo = model.current;
    return (
      <MediaViewerDialogEl open={model.open} onClose={this.onClose} >
        <MediaViewerHeader>
          <MediaObjectName>{mo && mo.name}</MediaObjectName>
          <HeaderButton onClick={model.prev}><ArrowBackIcon /></HeaderButton>
          <HeaderButton onClick={model.next}><ArrowForwardIcon /></HeaderButton>
          <HeaderButton onClick={this.onClose}><CloseIcon /></HeaderButton>
        </MediaViewerHeader>
        <MediaViewerBody>
          {mo && <ImagePreview src={withAuth(mo.url)} />}
        </MediaViewerBody>
      </MediaViewerDialogEl>
    );
  }

  @action.bound
  private onClose() {
    this.props.model.open = false;
  }
}
