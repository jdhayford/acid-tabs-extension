import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import formik, { Formik, Field, Form, useFormik, FieldArray } from "formik";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';


import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './Popup.css';

const ACID_GREEN = '#12FA73';

const Wrapper = styled.div`
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
  &:hover {
    cursor: pointer;
    color: ${ACID_GREEN};
  }

  ${props => props.disabled && css`
    opacity: 0.25;

    &:hover{
      cursor: initial;
      color: inherit;
    }
  `}
`


const RuleForm = (props) => {
  const { groupRules, saveGroupRules } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [magicNumber, setMagicNumber] = useState(0);

  const onFinish = values => {
    console.log('Received values of form:', values);
  };
  const formik = useFormik({
    initialValues: {
      groupRules
    },
    onSubmit: (values) => {
      saveGroupRules(values.groupRules)
    },
  });

  const removeRule = (index) => {
    formik.setFieldValue(formik.values.groupRules.splice(index, 1));
    setIsDirty(true);
  }

  const forceUpdate = () => setMagicNumber(magicNumber + 1)

  const updateRuleOrder = (index, change) => {
    const otherIndex = index + change;
    console.log(otherIndex)
    console.log(formik.values)
    formik.values.groupRules[index].key = otherIndex;
    formik.values.groupRules[otherIndex].key = index;
    // formik.values.groupRules.sort((a, b) => a.key - b.key))
    formik.setFieldValue(formik.values.groupRules.sort((a, b) => a.key - b.key));
    setIsDirty(true)
  }
  const allowUp = index => index > 0;
  const allowDown = index => index < (formik.values.groupRules && formik.values.groupRules.length - 1);

  console.log(formik)
  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        {/* <Icon style={{ position: 'absolute' }}><ArrowBackIcon /></Icon> */}
        {/* <Row key='title' justifyContent='center' padding='0 0 0.5rem'>
          <Title>Rules</Title>
        </Row> */}
        {formik.values.groupRules.map((groupRule, i) => (
          <div key={groupRule.key || '0'} alignItems='flex-end'>
            {/* <PreCol>
              <Icon>
                <RemoveIcon onClick={() => removeRule(i)} />
              </Icon>
            </PreCol> */}
            <TextField
              fullWidth
              key={`groupRules.${i}.pattern`}
              name={`groupRules.${i}.pattern`}
              label={i === 0 ? "Pattern" : null}
              value={groupRule.pattern}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              key={`groupRules.${i}.name`}
              name={`groupRules.${i}.name`}
              label={i === 0 ? "Name" : null}
              value={groupRule.name}
              onChange={formik.handleChange}
            />
            <ArrowUpwardIcon className={`icon ${!allowUp(i) ? 'disabled' : ''}`} onClick={() => allowUp(i) && updateRuleOrder(i, -1)} />
            <ArrowDownwardIcon className={`icon ${!allowDown(i) ? 'disabled' : ''}`} onClick={() => allowDown(i) && updateRuleOrder(i, 1)} />
          </div>
        ))}

        {/* <Row padding='0.5rem 0' justifyContent='center'>
          <Icon><AddIcon onClick={() => formik.setFieldValue(formik.values.groupRules.push({}))} /></Icon>
        </Row> */}
        <Button color="primary" variant="contained" fullWidth type="submit" disabled={!(formik.dirty || isDirty)}>
          Save
        </Button>
      </form>
    </div>
  );
};
  // <Formik
  //   initialValues={{ groupRules }}
  //   onSubmit={async values => {
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     alert(JSON.stringify(values, null, 2));
  //   }}
  //   render={({ values }) => (
  //     <Form>
  //       <FieldArray
  //         name="groupRules"
  //         render={arrayHelpers => (
  //           <div>
  //             {values.groupRules && values.groupRules.length > 0 ? (
  //               values.groupRules.map((friend, index) => (
  //                 <div key={index}>
  //                   <Row>
  //                     <Field name={`groupRules.${index}.key`} type="number" />
  //                     <TextField
  //                       fullWidth
  //                       name={`groupRules.${index}.key`}
  //                       type="text"
  //                       value={formik.values.password}
  //                       onChange={formik.handleChange}
  //                     />
  //                     <Field name={`groupRules.${index}.pattern`} type="text" />
  //                     <Field name={`groupRules.${index}.name`} type="text" />
  //                     <button type="submit">Submit</button>
  //                     <button
  //                       type="button"
  //                       onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
  //                     >
  //                       -
  //                     </button>
  //                     <button
  //                       type="button"
  //                       onClick={() => arrayHelpers.insert(index, '')} // insert an empty string at a position
  //                     >
  //                       +
  //                     </button>
  //                   </Row>
  //                 </div>
  //               ))
  //             ) : (
  //               <button type="button" onClick={() => arrayHelpers.push('')}>
  //                 {/* show this when user has removed all friends from the list */}
  //                 Add Rule
  //               </button>
  //             )}
  //             <div>
  //               <button type="submit">Submit</button>
  //             </div>
  //           </div>
  //         )}
  //       />
  //     </Form>
  //   )}
  // />
  

  export default RuleForm;
  