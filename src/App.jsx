import { Form, Formik,Field } from "formik";
import { useCallback, useState } from "react"
import OptimizedMentionEditor from './MentionsTextEditor'
import * as Yup from 'Yup'

function App() {
  // const [text,setText] = useState('')
  const [mentions,setMentions] = useState({})
  const [value,setValue] = useState("");

  const mentionTags = ['karamjeet','abhishek' , 'akshay']
  const onContentChange = useCallback((text,html,form) => {
    setValue(text)
    console.log("form",form)
    form.setFieldValue('mentionFieldValue', text?.replace(/\n/g, ''));
  },[])
  const onMentionValueChange = useCallback((id,value) => {
    setMentions((prevMentions) => ({
      ...prevMentions,  
      [id]: value        
    }));
  },[])

  const initialValues = {
    mentionFieldValue : '@karamjeet singh sdcbsdjhc'
  }

  console.log("mentions",mentions)
  const validationSchema = Yup.object({
    mentionFieldValue: Yup.string()
      .required("This field is required") 
      .min(3, "Must be at least 3 characters") 
  });

  return (
    <div style={{margin:"20rem"}}> 
    <Formik initialValues={initialValues} validationSchema={validationSchema}>
      <Form>
      <Field name="mentionFieldValue">{({form,field,meta})=>(
      <OptimizedMentionEditor
    editorId = 'mentionFieldValue'
    mentionTags = {mentionTags}
    initialContent = {initialValues.mentionFieldValue}
    placeholder = 'Type your message...'
    showEmoji
    onContentChange = {(text,html)=>onContentChange(text,html,form)}
    onValidationChange = {(one,two)=>{}}
    onMentionValueChange = {onMentionValueChange}
    className = ''
    disabled = {false}
    onBlur = {(e)=>form.setFieldTouched('mentionFieldValue',true)}
    error = {meta.touched && meta.error}
    />
  )}</Field>
      </Form>
    </Formik>


    {value==="" ? "Can not empty" : ""}
    </div>
  )
}

export default App
