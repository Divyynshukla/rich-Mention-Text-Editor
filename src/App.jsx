import { useCallback, useState } from "react"
import SmartMentionEditor from './MentionsTextEditor'

function App() {
  const [mentionValues, setMentionsValues] = useState({ add_to_cart: "value of cart" })
  const [value, setValue] = useState("");

  const mentionTags = ['add_to_cart', 'price', 'flying_tying']
  const onContentChange = useCallback((text, html) => {
    setValue(text)
  }, [])
  const onMentionValueChange = useCallback((id, value) => {
    setMentionsValues((prevMentions) => ({
      ...prevMentions,
      [id]: value
    }));
  }, [])

  const initialValues = {
    mentionFieldValue1: '',
    mentionFieldValue2: ''
  }

  const handleBlur = () => {

  }

  return (
    <>    
    <div style={{margin:"20rem"}}>
       
       <div style={{marginTop:'10rem' ,width:"40rem"}}>
        <SmartMentionEditor
          editorId='mentionFieldValue'
          mentionTags={mentionTags}
          initialContent={initialValues.mentionFieldValue1}
          placeholder='Type your message...'
          showEmoji
          onContentChange={(text, html) => onContentChange(text, html)}
          onValidationChange={(isValid, error) => {}}
          onMentionValueChange={onMentionValueChange}
          className=''
          disabled={false}
          showMentionInput
          mentionValues={mentionValues}
          onBlur={handleBlur}
          error={''}
          style = {{
            editorStyle : {
              height : "40rem"
            }
          }}
        />
       </div>

        
        <div>
      <div style={{marginTop:'5rem' ,width:"30rem"}}>
        <SmartMentionEditor
          editorId='mentionFieldValue2'
          mentionTags={mentionTags}
          initialContent={initialValues.mentionFieldValue2}
          placeholder='Type your message...'
          // showEmoji
          onContentChange={(text, html) => { }}
          onValidationChange={(isValid, error) => {}}
          onMentionValueChange={onMentionValueChange}
          className=''
          disabled={false}
          mentionValues={mentionValues}
          onBlur={(e) => { }}
          error=''
          isUrlField
        />
      </div>
      </div>
    </div>
    </>
  )
}

export default App
