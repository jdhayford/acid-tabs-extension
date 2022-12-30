import * as React from 'react';
import Modal from '@material-ui/core/Modal';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styled from 'styled-components';

const PickerWrapper = styled.div`
  em-emoji-picker {
    margin-top: 5vh;
    height: 90vh;
  }
`

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '100vh',
  width: '80vw',
  paddingLeft: '26vw',
  backgroundColor: 'rgba(21, 24, 30, 0.7)',
  boxShadow: 90,
};

const EmojiModal = (props) => {
  const { open = false, handleClose, handleEmojiSelection } = props;

  const onEmojiSelect = (emoji) => {
    handleEmojiSelection(emoji.native);
    handleClose();
  }

  return <div>
    <Modal
      open={open}
      style={modalStyle}
      onClick={() => handleClose()}
    >
      <PickerWrapper onClick={(e) => e.stopPropogation()}>
        <Picker
          className="picker"
          autoFocus
          data={data}
          maxFrequentRows={3}
          perLine={9}
          onEmojiSelect={onEmojiSelect}
        // onClickOutside={() => handleClose()}
        />
      </PickerWrapper>
    </Modal>
  </div>
}

export default EmojiModal;