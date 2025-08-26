import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import EmojiIcon from './assets/happy.png'

// ========================= CONSTANTS =========================
const CONSTANTS = {
  MENTION_PATTERN: /@([a-zA-Z0-9_]+)/g,
  URL_PATTERN: /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%?=~_|])/gi,
  DEFAULT_VALUE: 'DEFAULT VALUE',
  MAX_INPUT_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  EMPTY_CONTENT_MARKERS: ['', '\u200B', '<br>']
};

const STYLES = {
  container: { position: "relative", overflow: "visible" },
  mentionSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#e3f2ff',
    padding: '3.5px',
    color: '#4a7cb5',
    borderRadius: '4px',
    margin: '0 2px'
  },
  mentionInput: {
    width: '7rem',
    height: '16px',
    border: '1px solid lightgrey',
    outline: 'none',
    fontSize: '0.75rem',
    padding: '2px 4px'
  },
  mentionList: {
    position: "absolute",
    backgroundColor: "#fff",
    maxWidth: "500px",
    maxHeight: "250px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    border: "1px solid #e0e0e0"
  },
  mentionItem: {
    padding: "10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease"
  }
};

// ========================= UTILITIES =========================
class DOMUtils {
  static getCaretPosition(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return {
      left: rect.left - elementRect.left,
      top: rect.bottom - elementRect.top,
      range
    };
  }

  static setCaretPosition(element, position) {
    const range = document.createRange();
    const selection = window.getSelection();
    
    try {
      range.setStart(position.startContainer, position.startOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.warn('Could not set caret position:', error);
    }
  }

  static createMentionElement(tag, value, editorId, handlers,showMentionInput) {
    const wrapper = document.createElement('span');
    wrapper.className = 'mention-wrapper';
    wrapper.contentEditable = 'false';
    wrapper.style.cssText = Object.entries(STYLES.mentionSpan)
      .map(([key, val]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val}`)
      .join('; ');

    const label = document.createElement('span');
    label.textContent = `@${tag}`;
    label.style.marginRight = '4px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || CONSTANTS.DEFAULT_VALUE;
    input.placeholder = 'Enter value';
    input.dataset.mentionId = tag;
    input.dataset.editorId = editorId;
    input.style.cssText = Object.entries(STYLES.mentionInput)
      .map(([key, val]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val}`)
      .join('; ');

    // Event handlers
    input.addEventListener('input', handlers.onInputChange);
    input.addEventListener('blur', handlers.onInputBlur);
    input.addEventListener('keydown', handlers.onInputKeyDown);
    input.addEventListener('focus', handlers.onInputFocus);

    wrapper.appendChild(label);
    if(showMentionInput){
        wrapper.appendChild(input);
    }

    return wrapper;
  }

  static findTextNode(element, text, offset) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentOffset = 0;
    let node;

    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentOffset + nodeLength >= offset) {
        return {
          node,
          offset: offset - currentOffset
        };
      }
      currentOffset += nodeLength;
    }

    return null;
  }
  
  static getRelativePosition = (element) => {
    let top = 0,
      left = 0;
    while (element) {
      top += element.offsetTop;
      left += element.offsetLeft;
      element = element.offsetParent;
    }
    return { top, left };
  };

  static cleanupEmptyElements(element) {
    const emptyElements = element.querySelectorAll('span:empty, div:empty');
    emptyElements.forEach(el => {
      if (!el.classList.contains('mention-wrapper')) {
        el.remove();
      }
    });
  }
}

class TextParser {
    static parseTextToHTML(text, mentionTags, mentionValues, editorId,showMentionInput) {
        if (!text) return '';

        // Handle URLs
        let result = text.replace(CONSTANTS.URL_PATTERN, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });

        // Handle mentions
        result = result.replace(CONSTANTS.MENTION_PATTERN, (mention, mentionText) => {
            mentionText = mentionText.trim();
            const matchingTag = mentionTags.find(tag => mentionText.includes(tag));

            if (matchingTag) {

                if (showMentionInput) {
                    const inputValue = mentionValues[mentionText] || CONSTANTS.DEFAULT_VALUE;

                    return ` <span class="mention-wrapper" contenteditable="false" style="display:inline-flex;align-items:center;background-color:#e3f2ff;padding:3.5px;color:#4a7cb5;border-radius:4px;margin:0 2px;">
               <span style="display:inline-block;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:4px;">
               @${matchingTag}
              </span>
             <input type="text" data-mention-id="${matchingTag}" data-editor-id="${editorId}" placeholder="Enter value"
             style="width:7rem;height:16px;border:1px solid lightgrey;outline:none;font-size:0.75rem;padding:2px 4px;" 
            value="${inputValue}">
             </span> ${mentionText.slice(matchingTag.length)}`;
                }
                else {
                    return ` <span class="mention-wrapper" contenteditable="false" style="display:inline-flex;align-items:center;background-color:#e3f2ff;padding:3.5px;color:#4a7cb5;border-radius:4px;margin:0 2px;">
               <span style="display:inline-block;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:4px;">
               @${matchingTag}
              </span>
             </span> ${mentionText.slice(matchingTag.length)}`;
                }
            }

            return mention;
        });

        return result;
    }

    static extractMentionsFromText(text, mentionTags) {
        const mentions = [];
        const matches = text.matchAll(CONSTANTS.MENTION_PATTERN);

        for (const match of matches) {
            const mentionText = match[1].trim();
            const matchingTag = mentionTags.find(tag => mentionText.includes(tag));

            if (matchingTag && !mentions.includes(matchingTag)) {
                mentions.push(matchingTag);
            }
        }

        return mentions;
    }

    static cleanText(text) {
        // Remove standalone @ characters
        return text.replace(/(^|\s)@(?!\S)/g, "$1");
    }

}

class ValidationUtils {
  static validateMentionInputs(editor, editorId) {
    const inputs = editor.querySelectorAll(`input[data-editor-id="${editorId}"]`);
    const errors = [];
    
    inputs.forEach(input => {
      const value = input.value.trim();
      const mentionId = input.dataset.mentionId;
      
      if (value?.toLowerCase() === 'default value') {
        errors.push({
          type: 'empty',
          mentionId,
          message: `Default value is not allowed @${mentionId}`
        });
      } else if (value.length > CONSTANTS.MAX_INPUT_LENGTH) {
        errors.push({
          type: 'length',
          mentionId,
          message: `Default value of each property should not exceed undefined characters.`
        });
      }
    });

    return errors;
  }

  static formatErrorMessage(errors) {
    if (errors.length === 0) return '';
    
    const emptyErrors = errors.filter(e => e.type === 'empty');
    const lengthErrors = errors.filter(e => e.type === 'length');
    
    let message = '';
    
    if (emptyErrors.length > 0) {
      const mentions = emptyErrors.map(e => e.mentionId).join(', ');
      message += `Default value is not allowed for: ${mentions}`;
    }
    
    if (lengthErrors.length > 0) {
      if (message) message += '. ';
      message += 'Default value of each property should not exceed undefined characters.';
    }
    
    return message;
  }
}

// ========================= CUSTOM HOOKS =========================
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const useMentionSuggestions = (mentionTags, isVisible) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const resetFocus = useCallback(() => {
    setFocusedIndex(0);
  }, []);

  const navigate = useCallback((direction) => {
    setFocusedIndex(prev => {
      if (direction === 'up') {
        return prev <= 0 ? mentionTags.length - 1 : prev - 1;
      } else {
        return prev >= mentionTags.length - 1 ? 0 : prev + 1;
      }
    });
  }, [mentionTags.length]);

  const getSelectedTag = useCallback(() => {
    return mentionTags[focusedIndex];
  }, [mentionTags, focusedIndex]);

  useEffect(() => {
    if (isVisible) {
      resetFocus();
    }
  }, [isVisible, resetFocus]);

  return {
    focusedIndex,
    position,
    setPosition,
    setFocusedIndex,
    navigate,
    getSelectedTag,
    resetFocus
  };
};

const useValidation = (editorId, onValidationChange) => {
  const [errors, setErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = useCallback((editor) => {
    const newErrors = ValidationUtils.validateMentionInputs(editor, editorId);
    const message = ValidationUtils.formatErrorMessage(newErrors);
    
    setErrors(newErrors);
    setErrorMessage(message);
    
    onValidationChange?.(newErrors.length === 0, newErrors);
  }, [editorId, onValidationChange]);

  const debouncedValidate = useDebounce(validate, CONSTANTS.DEBOUNCE_DELAY);

  return {
    errors,
    errorMessage,
    validate,
    debouncedValidate
  };
};

// ========================= MAIN COMPONENT =========================
const SmartMentionEditor = ({
  editorId = 'mention-editor-1',
  mentionTags = [],
  initialContent = '',
  placeholder = 'Type your message...',
  showEmoji = false,
  onContentChange,
  onValidationChange,
  onMentionValueChange,
  className = '',
  style = {},
  onBlur,
  error,
  disabled = false,
  showMentionInput = false,
  mentionValues = {},
  locale = 'en',
  isUrlField,
}) => {
  // State
  const [content, setContent] = useState(initialContent);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [mentionValues, setMentionValues] = useState({});
  const [EmojiPickerComponent,setEmojiPickerComponent] = useState(null)  
  const [savedRange,setCurrentRange] =  useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  // Refs
  const editorRef = useRef(null);
  const suggestionsRef = useRef(null);
  const currentRangeRef = useRef(null);
  const AtCharRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiIconRef = useRef(null); 
  // Custom hooks
  const suggestions = useMentionSuggestions(mentionTags, showSuggestions);
  const validation = useValidation(editorId, onValidationChange);

  
  // Event handlers
  const handleInputChange = useCallback((event) => {
    const { value } = event.target;
    const mentionId = event.target.dataset.mentionId;
    
    // setMentionValues(prev => ({
    //   ...prev,
    //   [mentionId]: value
    // }));

    onMentionValueChange?.(mentionId, value);
    validation.debouncedValidate(editorRef.current);
  }, [onMentionValueChange, validation,mentionValues]);

  const handleInputKeyDown = useCallback((event) => {
    event.stopPropagation();
    
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      event.target.blur();
      editorRef.current?.focus();
    }
  }, []);

  const handleInputFocus = useCallback((event) => {
    // event.stopPropagation();
  }, []);

  const handleInputBlur = useCallback(() => {
    validation.validate(editorRef.current);
  }, [validation]);

  const inputHandlers = useMemo(() => ({
    onInputChange: handleInputChange,
    onInputKeyDown: handleInputKeyDown,
    onInputFocus: handleInputFocus,
    onInputBlur: handleInputBlur
  }), [handleInputChange, handleInputKeyDown, handleInputFocus, handleInputBlur]);

  // Helper function to attach event listeners to input fields
  const attachInputEventListeners = useCallback(() => {
    if (!editorRef.current) return;
    
    const inputs = editorRef.current.querySelectorAll(`input[data-editor-id="${editorId}"]`);
    inputs.forEach(input => {
      // Remove existing listeners to prevent duplicates
      input.removeEventListener('input', handleInputChange);
      input.removeEventListener('blur', handleInputBlur);
      input.removeEventListener('keydown', handleInputKeyDown);
      input.removeEventListener('focus', handleInputFocus);
      
      // Add new listeners
      input.addEventListener('input', handleInputChange);
      input.addEventListener('blur', handleInputBlur);
      input.addEventListener('keydown', handleInputKeyDown);
      input.addEventListener('focus', handleInputFocus);
    });
  }, [editorId, handleInputChange, handleInputBlur, handleInputKeyDown, handleInputFocus]);


  // Handle @ symbol insertion
  const handleAtSymbolInsertion = useCallback(() => {
    if (!editorRef.current) return;
    
    const textContent = editorRef.current.innerText;
    if (textContent.includes('@')) {
      const parsedHTML = TextParser.parseTextToHTML(
        textContent,
        mentionTags,
        mentionValues,
        editorId,
        showMentionInput
      );
      
      if (parsedHTML !== editorRef.current.innerHTML) {
        const selection = window.getSelection();
        const currentRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        // editorRef.current.innerHTML = parsedHTML;
        
        // Re-attach event listeners
        attachInputEventListeners();
        
        // Try to restore cursor position
        // if (currentRange) {
        //   try {
        //     selection.removeAllRanges();
        //     selection.addRange(currentRange);
        //   } catch (e) {
        //     // Ignore cursor restoration errors
        //   }
        // }
      }
    }
  }, [mentionTags, mentionValues, editorId, attachInputEventListeners]);

  useEffect(() => {
    if (showEmoji) {
      import("./EmojiPicker")
        .then((mod) => setEmojiPickerComponent(() => mod.default))
        .catch(() => {
          console.error(
            "Please install @emoji-mart/react and @emoji-mart/data to use emoji picker."
          );
        });
    }
  }, [showEmoji]);

  const insertMention = useCallback((tag) => {
    if (!currentRangeRef.current || !editorRef.current) return;

    const range = currentRangeRef.current;
    const editor = editorRef.current;

    const textNode = range.startContainer;
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent;
      const offset = range.startOffset;
      
      if (text[offset - 1] === '@') {
        textNode.deleteData(offset - 1, 1);
        range.setStart(textNode, offset - 1);
      }
    }

    //deleting <span>@</span> that added when inserting @ via @icon click
    let prevNode = null;
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    prevNode = range.startContainer.previousSibling;
  } else if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
    prevNode = range.startContainer.childNodes[range.startOffset - 1];
  }

  if (prevNode && prevNode.nodeType === Node.ELEMENT_NODE) {
    const el = prevNode;
    if (el.tagName === "SPAN" && el.textContent === "@") {
      el.remove();
    }
  }
    // Create mention element
    onMentionValueChange?.(tag,mentionValues?.[tag] || 'DEFAULT VALUE')
    const mentionElement = DOMUtils.createMentionElement(
      tag,
      mentionValues?.[tag],
      editorId,
      inputHandlers,
      showMentionInput,
      style
    );

    // Insert mention
    range.insertNode(mentionElement);
    
    // Position cursor after mention
    range.setStartAfter(mentionElement);
    range.collapse(true);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Update content
    // setContent(editor.innerText);
    onContentChange?.(editor.innerText, editor.innerHTML);
    
    // Hide suggestions
    setShowSuggestions(false);
    currentRangeRef.current = null;

    // Validate
    validation.debouncedValidate(editor);
    // TextParser.removeStandaloneAtCharacters(editor);
  }, [mentionValues, editorId, inputHandlers, onContentChange, validation]);

  const handleKeyDown = useCallback((event) => {
    if (showSuggestions) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          suggestions.navigate('down');
          break;
        case 'ArrowUp':
          event.preventDefault();
          suggestions.navigate('up');
          break;
        case 'Enter':
          event.preventDefault();
          const selectedTag = suggestions.getSelectedTag();
          if (selectedTag) {
            insertMention(selectedTag);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
      return;
    }

    // Handle backspace for empty editor
    if (event.key === 'Backspace') {
      const editor = editorRef.current;
      if (editor && CONSTANTS.EMPTY_CONTENT_MARKERS.includes(editor.innerHTML.trim())) {
        editor.innerHTML = '';
        // setContent('');
        onContentChange?.('', '');
      }
    }
  }, [showSuggestions, suggestions, insertMention, onContentChange]);

  const handleKeyUp = useCallback((event) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent;
      const offset = range.startOffset;

      if (text[offset - 1] === '@') {
        currentRangeRef.current = range.cloneRange();

        const position = DOMUtils.getCaretPosition(editorRef.current);
        setCurrentRange(range);
        
        if (position) {
          suggestions.setPosition({
            left: position.left,
            top: position.top + 5
          });
          setShowSuggestions(true);
        }
      }
      else if(showSuggestions){
        setShowSuggestions(false)
      }
    }
  }, [showSuggestions, suggestions]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    
    // setContent(newContent);
    if (editor.innerHTML === `<br>`) {
        editorRef.current.innerHTML = '';
      }
      const newContent = editor.innerText;
      onContentChange?.(newContent, editor.innerHTML);
    

    // Parse content for mentions and URLs if @ symbol is present
    if (newContent.includes('@')) {
      // Debounce the parsing to avoid too frequent updates
      setTimeout(() => {
        handleAtSymbolInsertion();
      }, 100);
    }
    
    // Clean up empty elements
    DOMUtils.cleanupEmptyElements(editor);
    
    // Validate mentions
    validation.debouncedValidate(editor);
  }, [onContentChange, validation, handleAtSymbolInsertion]);


  const insertEmoji = (emoji, editorId) => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editor.contains(selection.anchorNode)) {
        const emojiNode = document.createElement('span');
        emojiNode.textContent = emoji.native;
        range.insertNode(emojiNode);
        range.setStartAfter(emojiNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      else {
        const emojiNode = document.createElement('span');
        emojiNode.textContent = emoji.native;
        editor.appendChild(emojiNode);
      }
    } else {
      const emojiNode = document.createElement('span');
      emojiNode.textContent = emoji.native;
      editor.appendChild(emojiNode);
    }
    // setShowEmojiPicker(false)
    onContentChange(editor.innerText,editor.innerHTML)
  };

  const handlePaste = useCallback((event) => {
    event.preventDefault();
    
    // Handle paste in input fields
    if (event.target.tagName === 'INPUT') {
      const input = event.target;
      const pasteText = event.clipboardData.getData('text/plain');
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const originalValue = input.value;
      const newValue = originalValue.slice(0, start) + pasteText + originalValue.slice(end);
      
      input.value = newValue;
      const newCursorPos = start + pasteText.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      
      // Trigger input change
      const changeEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(changeEvent);
      return;
    }

    // Handle paste in editor
    const paste = event.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(paste));
      range.collapse(false);
    }

    setTimeout(() => {
      if (editorRef.current) {
        const textContent = editorRef.current.innerText;
        const parsedHTML = TextParser.parseTextToHTML(
          textContent, 
          mentionTags, 
          mentionValues, 
          editorId,
          showMentionInput
        );
        
        editorRef.current.innerHTML = parsedHTML;
        
        attachInputEventListeners();
        
        handleInput();
      }
    }, 0);
  }, [mentionTags, mentionValues, editorId, handleInput, attachInputEventListeners]);

  const handleSuggestionClick = useCallback((tag) => {
    insertMention(tag);
  }, [insertMention]);

  const handleMentionIconClick = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    
    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = window.getSelection().getRangeAt(0);
      if (editor.contains(selection.anchorNode)) {
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.collapse(false);
      } else {
        range.selectNodeContents(editor);
        range.collapse(false);
      }
    } else {
      // No existing selection, create range at end of content
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    const textNode = document.createElement("span");
    textNode.textContent = `@`;
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    
    // Get position for suggestions
    const rect = range.getBoundingClientRect();
    const cursorPosition = DOMUtils.getRelativePosition(textNode);
    const editorPosition = DOMUtils.getRelativePosition(editor);

    
    // setCurrentRange(range);
    suggestions.setPosition({
      left: rect.left  + cursorPosition.left - editorPosition.left + 20,
      top: rect.top + cursorPosition.top - editorPosition.top + 15,
    });
    
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Store current range reference
    currentRangeRef.current = range;
    
    // Show suggestions
    setShowSuggestions(true);
}, []);

  const initializeEditor = useCallback(() => {
    if (!editorRef.current || !initialContent) return;
    
    const parsedHTML = TextParser.parseTextToHTML(
      initialContent,
      mentionTags,
      mentionValues,
      editorId,
      showMentionInput
    );
    
    editorRef.current.innerHTML = parsedHTML;
    attachInputEventListeners();
  }, [initialContent]);

  // Memoized styles
  const editorStyles = useMemo(() => ({
    ...STYLES.container,
    border: `1px solid ${(validation.errors.length > 0 || error) ? '#f44336' : '#ccc'}`,
    borderRadius: '4px',
    padding: isUrlField ? '8px 30px 8px 8px' : '12px 30px 12px 12px' ,
    minHeight: isUrlField ? '1rem' : '5rem',
    maxHeight: '20rem',
    overflow: 'auto',
    outline: 'none',
    fontSize: '14px',
    lineHeight: '1.4',
    ...style.editorStyle
  }), [validation.errors.length, style]);

  const containerStyles = useMemo(() => ({
     position: "relative", overflow: "visible",
     borderRadius: '4px',
    ...style.containerStyle
  }), [style]);

  // ========================= EFFECTS =========================
  const handleClickOutside = useCallback((event) => {

    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !emojiIconRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      // setMentionList(false)
    }
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target) && !AtCharRef.current.contains(event.target)
    ) {
      setShowSuggestions(false); 
    }


  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    initializeEditor();
  }, [initializeEditor]);

  useEffect(() => {
    if (editorRef.current) {
      const inputs = editorRef.current.querySelectorAll(`input[data-editor-id="${editorId}"]`);
      inputs.forEach(input => {
        const mentionId = input.dataset.mentionId;
        const newValue = mentionValues[mentionId];
        if (newValue !== undefined && input.value !== newValue) {
          input.value = newValue;
        }
      });
    }
  }, [mentionValues, editorId]);

  // ========================= RENDER =========================
  return (
    <div className={`mention-container ${className}`} style={containerStyles}>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={onBlur}
        style={editorStyles}
        data-placeholder={placeholder}
        className="mention-editor"
      >
        {content}
        </div>

      {/* Action Icons */}
      <div style={{ position: 'absolute', right: 8, top: 6, gap: 2 ,display : "flex" ,alignItems:"center",flexDirection: isUrlField ? "row":"column"}}>
        {mentionTags.length > 0 && (
          <button
            type="button"
            ref={AtCharRef}
            onClick={handleMentionIconClick}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#666',
              padding: 4,
              fontSize : "15px"

            }}
            title="Insert mention"
          >
            &#64;
          </button>
        )}
        
        {showEmoji && (
            <div>
          <button
            type="button"
            ref = {emojiIconRef}
            onClick={(e) => {setShowEmojiPicker(!showEmojiPicker);setAnchorEl(e.currentTarget)}}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: '#666',
              padding: 4,
            }}
            title="Insert emoji"
          >
          <img src={EmojiIcon} style = {{width:"15px"}}/>
          </button>
          </div>
        )}
      </div>
      {showSuggestions && mentionTags.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            ...STYLES.mentionList,
            left: suggestions.position.left,
            top: suggestions.position.top,
            ...style.mentionListStyle
          }}
        >
          {mentionTags.map((tag, index) => (
            <div
              key={tag}
              onClick={() => handleSuggestionClick(tag)}
              onMouseEnter={() => suggestions.setFocusedIndex(index)}
              style={{
                ...STYLES.mentionItem,
                backgroundColor: index === suggestions.focusedIndex ? '#1976d2' : 'transparent',
                color: index === suggestions.focusedIndex ? 'white' : 'black',
                ...style.mentionItemStyle
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {validation.errorMessage && (
        <div style={{ 
          color: '#dc2626', 
          fontSize: '75%', 
          marginTop: '3px',
          fontWeight : 500,
          lineHeight: 1.66
        }}>
          {validation.errorMessage}
        </div>
      )}
     
     {error && (
        <div style={{ 
          color: '#dc2626', 
          fontSize: '75%', 
          marginTop: '3px',
          fontWeight : 500,
          lineHeight: 1.66
        }}>
          {error}
        </div>
      )}

     
     {showEmoji && EmojiPickerComponent && <EmojiPickerComponent emojiPickerRef={emojiPickerRef} open={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} anchorEl={anchorEl} onSelect={(emoji) => insertEmoji(emoji, editorId)} locale={locale}/>}

      {/* CSS */}
      <style jsx>{`
        .mention-editor:empty:before {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
        }
        
        .mention-editor:focus:before {
          display: none;
        }
        
        .mention-wrapper input {
          user-select: text;
        }
      `}</style>
    </div>
  );
};

export default SmartMentionEditor;