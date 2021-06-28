import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import formik, { Formik, Field, Form, useFormik, FieldArray } from "formik";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DoneIcon from '@material-ui/icons/Check';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import MenuIcon from '@material-ui/icons/Menu';
import SortIcon from '@material-ui/icons/Sort';
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

import TabDemo from './TabDemo';


import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './Popup.css';

const ACID_GREEN = '#12FA73';
const ACID_ORANGE = '#fa7312';
const ACID_RED = '#fb4453';
const ACID_PURPLE = '#7312fa';
const DARK_BLUE = '#282C34';

const COLORS = {
  'grey': '#BDC1C6',
  'yellow': '#FDD663',
  'blue': '#89B4F8',
  'red': '#F28B82',
  'green': '#80C995',
  'purple': '#D7ADFB',
  'cyan': '#78D9EC',
  'pink': '#FF8BCB',
};

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

    &--delete:hover {
      color: ${ACID_RED};
    }
  }
    
  .icon.disabled {

    &:hover{
      cursor: initial;
      color: inherit;
    }
  }

  

  .MuiButton-root.expandable {
    justify-content: flex-start;

    .MuiButton-label > div {
      overflow: hidden;
        transition: max-width 150ms;
        white-space: nowrap;
        text-align: left;
        max-width: 0;
    }
  }

  .MuiButton-root.expandable:hover {
    .MuiButton-label > div {
        max-width: 10rem;
      }
  }

  .bottom-row {
    opacity: 0.2;
    transition: opacity 75ms ease-in;
  }

  .bottom-row--show {
    opacity: 1;
  }

  .moving {
    // background: red !important;
    transition: transform 75ms ease-in-out;
    transform: translate(0, 5px);
  }

  .moving--up {
    transform: translate(0, -2rem);
  }
  
  .moving--down {
    transform: translate(0, 2rem);
  }

  .moving--fade {
    opacity: 0;
  }

  .moving--indirect {
    svg {
      display: none;
    }
  }
`

const PreCol = styled.div`
  width: 6rem;
`
const PostCol = styled.div`
  width: 12rem;
`


const Icon = styled.div`
  cursor: pointer;
  color: #f1f1f1;
  &:hover {
    color: ${ACID_GREEN};
  }

  ${props => props.disabled && css`
    cursor: initial;

    &:hover{
      color: inherit;
    }
  `}
`

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: ${props => props.alignItems || 'center'};
  justify-content: ${props => props.justifyContent || 'initial'};
  padding: ${props => props.padding || '0'};

  ${(props) => !props.alwaysShow && css`
    svg {
      opacity: 0;
      transition: opacity 100ms;
    }

    &:hover {
      svg {
        opacity: 1;
      }

      .icon.disabled {
        opacity: 0.2;
      }
    }
  `}
`

const ColorCircle = styled.div`
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 0.125rem;
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
const FillColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`

const getAll = (ptrn) => {
  return new Promise((resolve) => {
      chrome.storage.sync.get(null, (data) => {
          if (!data) {
              resolve(undefined);
          } else {
              if (ptrn) {
                  resolve(Object.entries(data).filter(([k, v]) => k.match(ptrn)));
              } else {
                  resolve(Object.entries(data));
              }
          }
      
      });
  })
};

const getAcidTabGroups = async (windowId = null) => {
  const pattern = windowId ? `window:${windowId}:rule:.*:groupId` : `window:.*:rule:.*:groupId`
  const windowGroupEntries = await getAll(pattern);
  return windowGroupEntries.map(([k,v]) => v) || [];
};

const isAnyAcidTabGroupCollapsed = async () => {
  if (!chrome.tabGroups) return false;
  const acidTabGroups = await getAcidTabGroups();
  const rawTabGroups = await new Promise(resolve => chrome.tabGroups.query({}, resolve));
  const managedTabGroups = rawTabGroups.filter(tg => acidTabGroups.some(t => t === tg.id))
  const collapsedGroups = managedTabGroups.filter(tg => tg.collapsed)
  return collapsedGroups.length > 0;
}

const TAB_BORDER_COLOR = '#9a9a9a';

const ruleToText = rule => `${rule.name}, ${rule.pattern.replace('\n', '   ')}${rule.color ? ', ' + rule.color : ''}`

const RuleForm = (props) => {
  const { groupRules, saveGroupRules, handleUpdate, handleCollapseGroups, showConfirm, handleConfirm } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkValue, setBulkValue] = useState(groupRules.map(ruleToText).join('\n'));
  const [newestRule, setNewestRule] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showBottomRow, setShowBottomRow] = useState(false);
  const [movedRule, setMovedRule] = useState({});
  const formik = useFormik({
    initialValues: {
      groupRules
    },
    onSubmit: (values) => {
      saveGroupRules(values.groupRules)
    },
  });

  const removeRule = (index) => {
    formik.values.groupRules.splice(index, 1)
    formik.setFieldValue(formik.values.groupRules);
    setIsDirty(true);
    saveGroupRules(formik.values.groupRules)
  }

  const updateRuleOrder = (index, change) => {
    const otherIndex = index + change;
    setMovedRule({ [index]: change > 0 ? 'down' : 'up' })
    setTimeout(() => {
      formik.values.groupRules[index].key = otherIndex;
      formik.values.groupRules[otherIndex].key = index;
      formik.setFieldValue(formik.values.groupRules.sort((a, b) => a.key - b.key));
      setIsDirty(true)
      setMovedRule({})
      saveGroupRules(formik.values.groupRules)
    }, 100)
  }

  const getNewColor = () => {
    const colorCounts = Object.keys(COLORS).reduce((curr, prev) => ({ ...curr, [prev]: 0 }), {})
    formik.values.groupRules
      .filter(rule => rule.color && Number.isInteger(colorCounts[rule.color]))
      .forEach(rule => { colorCounts[rule.color] = colorCounts[rule.color] + 1 });
    const colorsSortedByUse = Object.entries(colorCounts)
      .sort((a, b) => a[1] - b[1])
      .map(c => c[0]);
    return colorsSortedByUse[0];
  }

  const addNewRule = () => {
    const newRule = {
      name: '',
      pattern: '',
      key: formik.values.groupRules.length,
      color: getNewColor(),
    }
    formik.setFieldValue(formik.values.groupRules.push(newRule));
    setNewestRule(formik.values.groupRules.length)
  }

  const allowUp = index => index > 0;
  const allowDown = index => index < (formik.values.groupRules && formik.values.groupRules.length - 1);
  const allValid = formik.values.groupRules.every(rule => rule.name.length > 0 && rule.pattern.length > 0)
  const changed = formik.dirty || isDirty;
  
  const textToRules = (rawText) => {
    const lines = rawText.split('\n');
    const rules = lines.map((line, i) => lineToRule(line, i)).filter(r => !!r)
    return rules;
  }
  const lineToRule = (text, key) => {
    const fields = text.split(',').map(f => f.replace('   ', '\n').trim())
    if (text.trim().length === 0) return null;
    if (fields.length < 2 || fields.length > 3 || fields.slice(0, 2).some(f => f.length === 0)) {
      return { error: 'Invalid format' }
    }
    const color = fields.length > 2 && Object.keys(COLORS).includes(fields[2]) ? fields[2] : getNewColor();
    return { key, name: fields[0], pattern: fields[1], color }
  }

  const handleCollapse = (state) => {
    setIsCollapsed(state)
    handleCollapseGroups(state)
  }

  const updateCollapsed = async() => {
    const newIsCollapsed = await isAnyAcidTabGroupCollapsed();
    setIsCollapsed(newIsCollapsed);
  }

  const toggleCollapseListener = async (command) => {
    if (command === 'toggle-collapse') {
      setTimeout(updateCollapsed, 100);
    }
  };

  useEffect(() => {
    if (allValid) {
      saveGroupRules(formik.values.groupRules)
      setBulkValue(formik.values.groupRules.map(ruleToText).join('\n'))
    }
  }, [formik.values.groupRules])

  useEffect(() => {
    updateCollapsed();
    setTimeout(() => setShowBottomRow(true), 10)
    chrome.commands.onCommand.addListener(toggleCollapseListener);
    return () => chrome.commands.onCommand.removeListener(toggleCollapseListener);
  }, [])

  if (showConfirm) {
    return <TabDemo onConfirm={handleConfirm} />;
  }

  if (isBulkMode) {
    const parsedRules = textToRules(bulkValue);
    const isBulkValid = parsedRules.every(r => !r.error)
    const confirmBulk = (rules) => {
      if (!isBulkValid) return;
      saveGroupRules(parsedRules, true)
      setIsBulkMode(false)
    }
    return (
      <Wrapper style={{ marginTop: '1rem', padding: '0 1rem' }}>
        <TextField
          fullWidth
          key={`bulkValue`}
          name={`bulkValue`}
          label='Raw Text Rules (per line: "name, pattern")'
          value={bulkValue}
          error={!isBulkValid}
          multiline
          placeholder='name, pattern'
          onChange={(e) => setBulkValue(e.target.value)}
        />
        <Row style={{ flex: 10, marginTop: '1rem', marginBottom: '1rem' }} alignItems='flex-end' justifyContent='center' alwaysShow>
          <Button disabled={!isBulkValid} variant='contained' color="primary" onClick={confirmBulk}>
            <DoneIcon style={{ paddingRight: '0.5rem' }} />
            Confirm
          </Button>
        </Row>
      </Wrapper>
    )
  }

  const getMove = (i) => {
    if (movedRule[i]) {
      return movedRule[i];
    }

    
    if (movedRule[i-1] == 'down') {
      if (i === 1) return 'fade';
      return 'up'
    }
    if (movedRule[i+1] == 'up') {
      if (i === 0) return 'fade';
      return 'down'
    }
  }

  const indirectlyMoved = i => getMove(i) && !movedRule[i];

  const shouldShowLabel = (i) => i === 0;

  return (
    <Wrapper style={{}}>
      <br />
      <form onSubmit={formik.handleSubmit}>
        {/* <Icon style={{ position: 'absolute' }}><ArrowBackIcon /></Icon> */}
        {formik.values.groupRules.length === 0 && (
          <FillColumn style={{ justifyContent: 'center', fontSize: '1.1rem' }}>
            <FilterListIcon style={{ fontSize: '2.5rem' }} />
            No rules yet, add one to start!
          </FillColumn>
        )}
        {/* {formik.values.groupRules.length > 0 && (
          <Row className={'special-hide'} key={'null'} alignItems='flex-end' style={{ paddingLeft: '1rem', boxSizing: 'border-box' }}>
            <TextField
              style={{ minWidth: '8rem' }}
              key={`groupRules.${0}.name`}
              name={`groupRules.${0}.name`}
              label={shouldShowLabel(0) ? "Name" : null}
              value
              required
              placeholder='Group Name'
            />
            <TextField
              fullWidth
              key={`groupRules.${0}.pattern`}
              name={`groupRules.${0}.pattern`}
              label={shouldShowLabel(0) ? "URL Pattern (space separated for multiple)" : null}
              required
              multiline
              placeholder='URL Pattern ("google.com")'
            />
            <Select
              key={`groupRules.${0}.color`}
              name={`groupRules.${0}.color`}
              displayEmpty
            >
              {Object.entries(COLORS).map(([colorKey, colorVal]) => (
                <MenuItem value={colorKey}><ColorCircle value={colorVal} /></MenuItem>
              ))}
            </Select>
          </Row>
        )} */}
        {formik.values.groupRules.map((groupRule, i) => (
          <Row className={getMove(i) ? `moving moving--${getMove(i)} ${indirectlyMoved(i) ? 'moving--indirect' : ''}` : ''} key={groupRule.key || '0'} alignItems='flex-end' style={{ paddingLeft: '1rem', boxSizing: 'border-box' }}>
            <TextField
              style={{ minWidth: '8rem' }}
              key={`groupRules.${i}.name`}
              name={`groupRules.${i}.name`}
              label={shouldShowLabel(i) ? "Name" : null}
              value={groupRule.name}
              error={formik.dirty && groupRule.name.length === 0}
              autoFocus={i === newestRule - 1}
              required
              placeholder='Group Name'
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              key={`groupRules.${i}.pattern`}
              name={`groupRules.${i}.pattern`}
              label={shouldShowLabel(i) ? "URL Pattern (space separated for multiple)" : null}
              value={groupRule.pattern}
              error={formik.dirty && groupRule.pattern.length === 0}
              required
              multiline
              placeholder='URL Pattern ("google.com")'
              onChange={formik.handleChange}
            />
            <Select
              key={`groupRules.${i}.color`}
              name={`groupRules.${i}.color`}
              value={groupRule.color}
              onChange={formik.handleChange}
              displayEmpty
              renderValue={(val) => (
                <ColorCircle value={COLORS[groupRule.color]} displayMode />
              )}
            >
              {Object.entries(COLORS).map(([colorKey, colorVal]) => (
                <MenuItem value={colorKey}><ColorCircle value={colorVal} /></MenuItem>
              ))}
            </Select>
            <PostCol>
              <ArrowUpwardIcon className={`icon ${!allowUp(i) ? 'disabled' : ''}`} onClick={() => allowUp(i) && updateRuleOrder(i, -1)} />
              <ArrowDownwardIcon className={`icon ${!allowDown(i) ? 'disabled' : ''}`} onClick={() => allowDown(i) && updateRuleOrder(i, 1)} />
              <DeleteIcon className='icon icon--delete' onClick={() => removeRule(i)} />
            </PostCol>
          </Row>
        ))}

        <Row className={`bottom-row ${showBottomRow ? 'bottom-row--show' : ''}`}  style={{ flex: 10, marginBottom: '1rem', marginTop: '1rem' }} alignItems='flex-end' justifyContent='space-between' alwaysShow>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <Tooltip title="Hotkey: Alt+Shift+C">
              <Button onClick={() => handleCollapse(!isCollapsed)} style={{ marginLeft: '1rem', minWidth: '8rem' }}>
                {isCollapsed ? (
                  <>
                    <ClearAllIcon style={{ paddingRight: '1.25rem' }} />
                    <div>Expand</div>
                  </>
                ) : (
                  <>
                    <SortIcon style={{ paddingRight: '0.5rem' }} />
                    <div>Collapse</div>
                  </>
                )}
              </Button>
            </Tooltip>
            <Button onClick={() => setIsBulkMode(true)} style={{ marginLeft: '0.5rem' }}>
              <EditIcon style={{ paddingRight: '0.75rem' }} />
              <div>Bulk Edit</div>
            </Button>
          </div>
          <Fab color="primary" aria-label="add" style={{ marginRight: '7rem' }} onClick={addNewRule}>
            <AddIcon />
          </Fab>
        </Row>
      </form>
    </Wrapper>
  );
};

export default RuleForm;
  