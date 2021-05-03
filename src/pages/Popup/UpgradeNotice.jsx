import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import RemoveIcon from '@material-ui/icons/Remove';
import Select from '@material-ui/core/Select';
import GmailIconUrl from '../../assets/img/gmail-icon.png';
import TwitterIconUrl from '../../assets/img/twitter-logo.png';
import GoogleIconUrl from '../../assets/img/google-icon.png';
import WarningIcon from '@material-ui/icons/Warning';



import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './Popup.css';

const ACID_GREEN = '#12FA73';
const DARK_BLUE = '#282C34';

const Icon = styled.div`
  cursor: pointer;
  &:hover {
    color: ${ACID_GREEN};
  }

  ${props => props.disabled && css`
    opacity: 0.25;
    cursor: initial;

    &:hover{
      color: inherit;
    }
  `}
`

const ExampleWrapper = styled.div`
  padding: 2rem 1rem;
  // margin: 0 1rem;
  flex-direction: column;
  align-items: center;
  // background-color: #1b2229;
  border-radius: 0.25rem;
  height: 100%;

  svg {
    font-size: 2.5rem;
  }
`

const FillColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`

const TAB_BORDER_COLOR = '#9a9a9a';

const Prompt = styled.div`
  font-size: 1rem;

  br {
    margin-top: 1rem;
  }

  span {
    font-weight: bold;
  }
`

const EverBlue = styled.a`
  font-size: 1.5rem;
  color: #89B4F8 !important;
`;

const UpgradeNotice = (props) => {
  const match = navigator.userAgent.match('Chrome\/([0-9.]+)');
  const currentVersion = match && match.length > 1 && match[1];
  
  return (
      <FillColumn>
      <ExampleWrapper>
          <WarningIcon />
          <Prompt>
            <br />
            Hey! It looks like your Chrome version may be a bit too old to use StickyTabs.
            <br />
            <br />
            Please update to <span>version 89 (or greater)</span> to use this extension.
            <br />
            <br />
            {currentVersion ? `[Currently ${currentVersion}]` : ''}
            <br />
            <br />
            <br />
            <EverBlue target='_blank' href='https://www.google.com/chrome/update/'>Update Chrome</EverBlue>
          </Prompt>
      </ExampleWrapper>
      </FillColumn>
  );
};

export default UpgradeNotice;
  