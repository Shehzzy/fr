import React from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import "react-quill/dist/quill.snow.css";

// ===== Register Quill Modules =====
Quill.register("modules/imageResize", ImageResize);
window.Quill = Quill; // helps to delete images from editor

// Font sizes
const fontSizeArr = [
  "8px",
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "32px",
  "36px",
  "42px",
  "54px",
  "60px",
];
const Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

// Fonts
const Font = Quill.import("attributors/style/font");
Font.whitelist = [
  "myriad-pro",
  "arial",
  "rubik",
  "karla",
  "music-sync",
  "grinched",
];
Quill.register(Font, true);

// Align
const Align = Quill.import("attributors/style/align");
Align.whitelist = ["left", "center", "right", "justify"];
Quill.register(Align, true);

// Custom Default Paragraph Style
const BlockPrototype = Quill.import("blots/block");
class CustomBlock extends BlockPrototype {
  constructor(domNode, value) {
    super(domNode, value);
    this.format("size", "18px");
    this.format("font", "karla");
  }
  static tagName = "P";
  format(name, value) {
    if (name === "size") {
      this.domNode.style.fontSize = value;
    } else if (name === "font") {
      this.domNode.style.fontFamily = value;
    } else {
      super.format(name, value);
    }
  }
}
Quill.register(CustomBlock, true);

// Undo / Redo Icons
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
);
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
);

// Handlers
function undoChange() {
  this.quill.history.undo();
}
function redoChange() {
  this.quill.history.redo();
}

// ===== Quill Config =====
export const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      undo: undoChange,
      redo: redoChange,
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize"],
  },
};

export const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "code-block",
];

// ===== Toolbar Component =====
const QuillToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="normal">
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="normal">Normal</option>
      </select>
      <select
        className="ql-font"
        defaultValue="karla"
        style={{ textTransform: "capitalize" }}
      >
        <option value="karla">karla</option>
        <option value="arial">arial</option>
        <option value="myriad-pro">myriad-pro</option>
        <option value="rubik">rubik</option>
        <option value="music-sync">music-sync</option>
        <option value="grinched">grinched</option>
      </select>
      <select className="ql-size" defaultValue="18px">
        {fontSizeArr.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-strike" />
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <button className="ql-indent" value="-1" />
      <button className="ql-indent" value="+1" />
    </span>
    <span className="ql-formats">
      <select className="ql-align" />
      <select className="ql-color" />
      <select className="ql-background" />
    </span>
    <span className="ql-formats">
      <button className="ql-link" />
      <button className="ql-image" />
      <button className="ql-video" />
    </span>
    <span className="ql-formats">
      <button className="ql-clean" />
    </span>
    <span className="ql-formats">
      <button className="ql-undo">
        <CustomUndo />
      </button>
      <button className="ql-redo">
        <CustomRedo />
      </button>
    </span>
  </div>
);

// ===== Reusable Editor Component =====
const CustomQuillEditor = ({ value, onChange, error }) => {
  return (
    <div className={`custom-quill-editor ${error ? "input-error" : ""}`}>
      <QuillToolbar />
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Enter Description"
      />
      {error && <span className="error-message">{error.message}</span>}
    </div>
  );
};

export default CustomQuillEditor;
