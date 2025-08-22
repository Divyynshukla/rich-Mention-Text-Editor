import { useCallback, useState } from "react"
import SmartMentionEditor from './MentionsTextEditor'

function App() {
  const [mentionValues, setMentionsValues] = useState({ add_to_cart: "value of cart" })
  const [value, setValue] = useState("");

  const mentionTags = ['add_to_cart', 'price', 'flying_to']
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
    <div style={{ margin: "10rem" }}>
       
       <div style={{margin:'1rem' ,width:"30rem"}}>
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
        />
       </div>

        
      <div style={{margin:'1rem' ,width:"30rem"}}>
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
          style = {{containerStyle : {
            backgroundColor:'red'
          },
           editorStyle : {
            backgroundColor : "yellow"
           },
           mentionListStyle : {
             backgroundColor:"white"
           },
           mentionItemStyle : {
            backgroundColor : "grey",
           },
          }}
        />
      </div>
    </div>
  )
}

export default App
