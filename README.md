# React + Vite + SmartMentionEditor

This project provides a minimal setup using **React** and **Vite**, ESLint, and a custom component called `SmartMentionEditor`.

Two official plugins can be used:

- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) – uses Babel for Fast Refresh.
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) – uses SWC for Fast Refresh.

---

## ✨ Features

- ✅ Fast development with Vite and HMR.
- ✅ Custom Mentions Editor (`SmartMentionEditor`).
- ✅ Emoji support with emoji-mart.
- ✅ Mentions input with dynamic tags like `@tag`.
- ✅ Customize styling of mentionList,MentionListItem,editor,container.
- ✅ Customize your mention as `@tag` or `@tag[input_field]`.

---


## Example

```jsx
import { useCallback, useState } from "react"
import SmartMentionEditor from 'richmentiontexteditor'

function Example() {
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

export default Example

```






| Prop Name              | Type                        | Required | Default | Description                                                      |
| ---------------------- | --------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| `editorId`             | `string`                    | ✅        | —       | A unique ID for the editor instance.                             |
| `mentionTags`          | `string[]`                  | ✅        | —       | Array of mention tags (e.g., `['@tag1', '@tag2']`).              |
| `onContentChange`      | `(text, html) => void`      | ✅        | —       | Callback when content changes.                                   |
| `onValidationChange`   | `(arg1, arg2) => void`      | ✅        | —       | Callback to return validation state.                             |
| `onMentionValueChange` | `(id: string, val: string)` | ✅        | —       | Called when a mention input value is changed.                    |
| `mentionValues`        | `object`                    | ✅        | `{}`    | Object storing values of all mentions with `@inputField`.        |
| `showMentionInput`     | `boolean`                   | ❌        | `false` | If `true`, renders mentions like `@tag[input field]`.            |
| `showEmoji`            | `boolean`                   | ❌        | `false` | If `true`, enables emoji support in the editor.                  |
| `disabled`             | `boolean`                   | ❌        | `false` | If `true`, disables the editor.                                  |
| `error`                | `string`                    | ❌        | `''`    | Displays error message if any.                                   |
| `onBlur`               | `() => void`                | ❌        | —       | Callback when the editor loses focus.                            |
| `style`                | `object`                    | ❌        | —       | Inline styles for the editor container.                        |
| `isUrlField`           | `boolean`                   | ❌        | `false` | If `true`, treats input as URL (styling or behavior may differ). |
