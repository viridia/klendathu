import * as React from 'react';
import { action } from 'mobx';
import styled from 'styled-components';

const PhotoPreview = styled.button`
  align-items: center;
  background-size: cover;
  border: none;
  display: inline-flex;
  height: 8rem;
  justify-content: center;
  overflow: hidden;
  outline: none;
  position: relative;
  width: 8rem;

  &:focus {
    box-shadow: 0 0 0 3px ${props => props.theme.focusColor};
    z-index: 1;
  }

  &.round {
    border-radius: 50%;
  }
`;

interface Props {
  className?: string;
  value: string;
  defaultPhoto?: string;
  onChange: (value: File) => void;
}

export class PhotoSelect extends React.Component<Props> {
  private fileInput: HTMLInputElement;

  public render() {
    const { className, value, defaultPhoto } = this.props;
    const url = value || defaultPhoto;
    return (
      <React.Fragment>
        <PhotoPreview
          className={className}
          style={{ backgroundImage: `url(${url})` }}
          onClick={this.onChangeProfilePhoto}
        >
          {!value && <div className="caption">Profile Photo</div>}
        </PhotoPreview>
        <input
            ref={el => { this.fileInput = el; }}
            accept="image/*"
            type="file"
            onChange={this.onFileChange}
            style={{ display: 'none '}}
        />
      </React.Fragment>
    );
  }

  @action.bound
  private onChangeProfilePhoto(e: any) {
    e.preventDefault();
    this.fileInput.click();
  }

  @action.bound
  private onFileChange(e: any) {
    if (this.fileInput.files.length > 0) {
      this.props.onChange(this.fileInput.files[0]);
    }
    this.fileInput.value = '';
  }
}
