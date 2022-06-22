import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import RemoveIcon from '@material-ui/icons/Remove';
import Select from '@material-ui/core/Select';
import GmailIconUrl from '../../assets/img/gmail-icon.png';
import TwitterIconUrl from '../../assets/img/twitter-logo.png';
import GoogleIconUrl from '../../assets/img/google-icon.png';
import { COLORS } from '../Colors';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './Popup.css';

const ACID_GREEN = '#12FA73';
const DARK_BLUE = '#282C34';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  
  form {
    
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    height: 100% !important;
  }

  .icon {
    &:hover {
      cursor: pointer;
      color: ${ACID_GREEN};
    }
  }
    
  .icon.disabled {
    opacity: 0.25;

    &:hover{
      cursor: initial;
      color: inherit;
    }
  }
`
const Title = styled.div`
  font-size: 1.5rem;
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const PreCol = styled.div`
  width: 6rem;
`
const PostCol = styled.div`
  width: 12rem;
`
const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: ${props => props.alignItems || 'center'};
  justify-content: ${props => props.justifyContent || 'initial'};
  padding: ${props => props.padding || '0'};
`

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

const ColorCircle = styled.div`
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 0.5rem;
  background-color: ${props => props.value || 'initial'};
  :after {
      content:"";
  }

  

  ${props => props.displayMode && css`
    margin-top: 0.4rem;
    margin-left: 0.4rem;

    ${props => !props.value && css`
      border: 1px solid #FDFDFD;
      opacity: 0.25;
    `}
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
`

const ColorSquare = styled.div`
  height: 1.0rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  background-color: ${props => props.value || 'initial'};
  color: black;
  font-size: 0.9rem;
`

const FillColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`

const FakeTabsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0 1rem;
  cursor: default;
  user-select: none;
  margin: 2rem 0;
`

const TAB_BORDER_COLOR = '#9a9a9a';

const TabWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  
  &::after {
    position: absolute;
    height: 0.2rem;
    margin-top: 2rem;
    width: 14.5rem;
    content: "";
    border-radius: 4px;
    background-color: ${COLORS.blue};
  }
`

const FakeTabWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  border-top: 1px solid ${TAB_BORDER_COLOR};
  border-left: 1px solid ${TAB_BORDER_COLOR};
  border-right: 1px solid ${TAB_BORDER_COLOR};
  border-bottom: none;
  padding: 0.2rem 0.5rem;
  margin: 0 0.25rem;
  border-radius: 0.5rem 0.5rem 0 0;
  
  img {
    height: 1.5rem;
    width: 1.5rem;
  }

  div {
    margin-left: 0.5rem;
    max-width: 8rem;
    text-overflow: ellipses;
    white-space: nowrap;
    overflow: hidden;
  }
`

const DisabledRow = styled(Row)`

  cursor: not-allowed !important;
  input {
    cursor: not-allowed !important;

  }
`

const Prompt = styled.div`
  font-size: 1rem;

  br {
    margin-top: 1rem;
  }
`

const FakeTab = ({ icon, name, groupName=null, groupColor=COLORS.blue }) => {
    if (groupName) {
        return (
            <TabWrapper>
                <ColorSquare value={groupColor}>
                {groupName}
                </ColorSquare>
                <FakeTabWrapper>
                  <img src={icon} />
                  <div>
                      {name}
                  </div>
                </FakeTabWrapper>
            </TabWrapper>
        )
    }

    return (
        <FakeTabWrapper>
            <img src={icon} />
            <div>
                {name}
            </div>
        </FakeTabWrapper>
    )
}


const ruleToText = rule => `${rule.name}, ${rule.pattern}${rule.color ? ', ' + rule.color : ''}`

const initialTabs = [
    { name: 'Inbox - johndoe@gmail.com', icon: GmailIconUrl, groupName: 'email', groupColor: COLORS.blue },
    { name: 'acid tabs extension', icon: GoogleIconUrl, groupName: null, groupColor: null },
    { name: 'Home / Twitter', icon: TwitterIconUrl, groupName: null, groupColor: null },
]

const TabDemo = (props) => {
    const { onConfirm } = props;
    const [tabs, setTabs] = useState(initialTabs);
  
    return (
        <FillColumn>
        <ExampleWrapper>
            <Prompt>
            Acid Tabs lets you automatically <span style={{ color: COLORS.blue, textDecoration: 'underline' }}>group</span> your tabs with url patterns
            </Prompt>
            <FakeTabsRow>
                {tabs.map(t => (
                    <FakeTab key={t.name} name={t.name} icon={t.icon} groupName={t.groupName} groupColor={t.groupColor} />
                ))}
            </FakeTabsRow>
            <DisabledRow alignItems='flex-end'>
                <PreCol style={{ opacity: 0 }}>
                    <Icon disabled>
                    <RemoveIcon />
                    </Icon>
                </PreCol>
                <TextField
                    fullWidth
                    disabled
                    label='Name'
                    value='email'
                />
                <TextField
                    fullWidth
                    disabled
                    label='URL Pattern'
                    value={'mail.google.com'}
                />
                <Select
                    value={COLORS.blue}
                    disabled
                    renderValue={(val) => (
                      <ColorCircle value={val} displayMode />
                    )}
                >
                </Select>
                <PostCol style={{ opacity: 0 }}>
                    <ArrowUpwardIcon className='icon disabled' />
                    <ArrowDownwardIcon className='icon disabled' />
                </PostCol>
            </DisabledRow>
            <Prompt style={{ marginTop: '4rem' }}>
            <Button color="primary" variant="contained" style={{ backgroundColor: COLORS.blue, color: DARK_BLUE }} onClick={() => onConfirm(true)}>
                Continue
            </Button>
            {/* Start by adding your first group below!<br /> */}
            </Prompt>
        </ExampleWrapper>
        </FillColumn>
    );
};

export default TabDemo;
  