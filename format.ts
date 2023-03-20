/*
A block element for cli output.  Supports several css like properties. For helping manage multiple lines, blocks can be nested.  The inner block will be rendered inside the outer block.  The inner block will be clipped to the outer block's dimensions.

if the content of the block doesn't fit in a single row, it will be wrapped to the next line.  This manifests as an iterator of lines.  The iterator will be empty if the block is empty.
*/

interface BlockOptions {
  width?: number;
  height?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  textAlign?: TextAlignStrings;
  background?: string;
  color?: string;
}

enum TextAlign {
  left = "left",
  right = "right",
  center = "center",
}

// TextAlign union
type TextAlignStrings = keyof typeof TextAlign;

class Block {
  public content: string;
  // the width of the block in characters. If not provided, the block will be rendered at its natural size.
  public width?: number;
  // the height of the block in characters. If not provided, the block will be rendered at its natural size.
  public height?: number;
  public paddingLeft: number;
  public paddingRight: number;
  public paddingTop: number;
  public paddingBottom: number;
  public textAlign: TextAlignStrings;

  constructor(content: string, options: BlockOptions = {}) {
    this.content = content;
    this.width = options.width;
    this.height = options.height;
    this.paddingLeft = options.paddingLeft || 0;
    this.paddingRight = options.paddingRight || 0;
    this.paddingTop = options.paddingTop || 0;
    this.paddingBottom = options.paddingBottom || 0;
    this.textAlign = options.textAlign || "left";
  }

  // Render the block as an iterator of lines.  Width and height are optional.  If not provided, the block will be rendered at its natural size.  Based on the width and height, the block will be clipped or padded. If the block is clipped, throw an error.  If the block is padded, the padding will be filled with spaces. Padding based on the width and height will be applied before the content is rendered.
  render(
    width?: number,
    height?: number,
  ): Iterator<string> {
    width = width || this.width;
    height = height || this.height;
    const lines = this.content.split("\n");
    const linesIterator = lines[Symbol.iterator]();
    const result = [];
    for (let i = 0; i < height; i++) {
      const line = linesIterator.next().value;
      if (line) {
        result.push(this.renderLine(line, width));
      } else {
        result.push(this.renderLine("", width));
      }
    }
    return result[Symbol.iterator]();
  }

  renderLine(line: string, width: number): string {
    const padding = this.paddingLeft + this.paddingRight;
    const contentWidth = width - padding;
    const content = this.renderContent(line, contentWidth);
    const leftPadding = this.renderPadding(this.paddingLeft);
    const rightPadding = this.renderPadding(this.paddingRight);
    return leftPadding + content + rightPadding;
  }

  renderContent(line: string, width: number): string {
    const content = this.clipContent(line, width);
    const padding = width - content.length;
    const leftPadding = this.renderPadding(Math.floor(padding / 2));
    const rightPadding = this.renderPadding(Math.ceil(padding / 2));
    return leftPadding + content + rightPadding;
  }

  renderPadding(padding: number): string {
    return " ".repeat(padding);
  }

  clipContent(line: string, width: number): string {
    if (line.length > width) {
      return line.slice(0, width);
    } else {
      return line;
    }
  }

  [Symbol.iterator](): Iterator<string> {
    return this.render();
  }
}

/*
Multi column layout block accepts an array of blocks and renders lines from them as a single block.  It inherits from Block.  Additionally it takes the array of blocks to render and marginX (horizontal spacing).

The content property of the is not used. Instead, the blocks themselves are the content.

Each block could be multiline so rendering will need to account for that. For example if a left block only has a single line of content, while the right block allows has multiple lines, the left block will need to be padded with empty lines to match the height of the right block.  The longest block will determine the height of the layout block.

Rendering will need to account for the width of the blocks.  If the blocks don't fit in the width of the layout block, the blocks will clip, throwing an error.  If the blocks are padded, the padding will be filled with spaces. Padding based on the width and height will be applied before the content is rendered.
*/

interface MultiColumnLayoutOptions extends BlockOptions {
  blocks: Block[];
  marginX?: number;
}

// class MultiColumnLayoutBlock
