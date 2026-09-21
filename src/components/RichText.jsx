export default function RichText({ document }) {
    return (
      <div className="rich-text">
        {document.content.map((node, index) => (
          <NodeRenderer
            key={index}
            node={node}
          />
        ))}
      </div>
    );
  }
  
  function NodeRenderer({ node }) {
    switch (node.nodeType) {
      case "paragraph":
        return (
          <p>
            {node.content.map((child, index) => (
              <TextNode
                key={index}
                node={child}
              />
            ))}
          </p>
        );
  
      case "heading-2":
        return (
          <h2>
            {node.content.map((child, index) => (
              <TextNode
                key={index}
                node={child}
              />
            ))}
          </h2>
        );
  
      case "unordered-list":
        return (
          <ul>
            {node.content.map((child, index) => (
              <NodeRenderer
                key={index}
                node={child}
              />
            ))}
          </ul>
        );
  
      case "ordered-list":
        return (
          <ol>
            {node.content.map((child, index) => (
              <NodeRenderer
                key={index}
                node={child}
              />
            ))}
          </ol>
        );
  
      case "list-item":
        return (
          <li>
            {node.content.map((child, index) => (
              <NodeRenderer
                key={index}
                node={child}
              />
            ))}
          </li>
        );
  
      default:
        return null;
    }
  }
  
  function TextNode({ node }) {
    if (node.nodeType !== "text") {
      return null;
    }
  
    let content = node.value;
  
    const marks = node.marks || [];
  
    if (marks.some((mark) => mark.type === "bold")) {
      content = <strong>{content}</strong>;
    }
  
    if (marks.some((mark) => mark.type === "italic")) {
      content = <em>{content}</em>;
    }
  
    return content;
  }
  