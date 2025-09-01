import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

function EmojiPicker({
  emojiPickerRef,
  open,
  onClose,
  anchorEl,
  onSelect,
  locale = "en",
  emojiPos
}) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!open) return null;

  const picker = (
    <div
      ref={emojiPickerRef}
      className="iz-popover"
      style={{
        position: "fixed", 
        left: emojiPos?.left,
        top: emojiPos?.top,
        zIndex: 10000,
        maxHeight: "400px",   
        overflowY: "auto", 
      }}
    >
      <Picker
        theme="dark"
        locale={locale}
        previewPosition="none"
        data={data}
        onEmojiSelect={(emoji) => onSelect(emoji)}
      />
    </div>
  );

  return (
    <>
      <style>{`
        .iz-dialog-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .iz-dialog {
          background: #1A1A1A;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .iz-dialog-actions {
          padding: 10px;
          border-top: 1px solid #333;
        }
        .iz-button {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: #444;
          color: white;
          font-size: 14px;
          cursor: pointer;
        }
        .iz-button:hover {
          background: #666;
        }
      `}</style>

      {isSmallScreen ? (
        <div className="iz-dialog-overlay">
          <div className="iz-dialog">
            <Picker
              theme="dark"
              locale={locale}
              previewPosition="none"
              data={data}
              onEmojiSelect={(emoji) => onSelect(emoji)}
            />
            <div className="iz-dialog-actions">
              <button className="iz-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        ReactDOM.createPortal(picker, document.body)
      )}
    </>
  );
}

export default EmojiPicker;
