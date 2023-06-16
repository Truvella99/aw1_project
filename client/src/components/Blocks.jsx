import { useState,useContext } from "react";
import { Row,Col } from "react-bootstrap";
import { UserContext,render_componentsContext,onDragStartContext, onDragEnterContext, handleSortContext, removeBlockContext, saveBlockContext } from "./Contexts";
import { IMAGE_PATH } from "./Costants";

function Header(props) {
    // block object fo this block and current index in the block array 
    const { block, index } = props;
    // set the content editable
    const [editable, setEditable] = useState(false);
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // onDragStart shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // onDragStart shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // onDragStart shared with useContext hook
    const saveBlock = useContext(saveBlockContext);
    // user context
    const user = useContext(UserContext);
    // state for the current value of block content during the editing
    const [blockContent, setBlockContent] = useState(block.content);
    // condition of rendering shared with useContext hook
    const render_components = useContext(render_componentsContext);

    // function that handle the procedure to save the block
    function save() {
        setEditable(false);
        block.content = blockContent;
        saveBlock(block);
    }

    if (render_components) {
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='icons'>
                    <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
                    {'  '}
                    <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
                    {'  '}
                    <i className="bi bi-device-hdd-fill" onClick={() => save()}></i>
                </Col>
                <Col md={4}>
                    <h3 style={editable ? { backgroundColor: 'white' } : { overflow: 'hidden' }} contentEditable={editable} suppressContentEditableWarning={true} onInput={(event) => { setBlockContent(event.target.textContent) }}>
                        {block.content}
                    </h3>
                </Col>
            </Row>
        );
    } else {
        return <h3>{block.content}</h3>;
    }
}

function Paragraph(props) {
    // block object fo this block and current index in the block array 
    const { block, index } = props;
    // set the content editable
    const [editable, setEditable] = useState(false);
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // onDragStart shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // onDragStart shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // onDragStart shared with useContext hook
    const saveBlock = useContext(saveBlockContext);
    // user context
    const user = useContext(UserContext);
    // state for the current value of block content during the editing
    const [blockContent, setBlockContent] = useState(block.content);
    // condition of rendering shared with useContext hook
    const render_components = useContext(render_componentsContext);

    // function that handle the procedure to save the block
    function save() {
        setEditable(false);
        block.content = blockContent;
        saveBlock(block);
    }

    if (render_components) {
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='icons'>
                    <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
                    {'  '}
                    <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
                    {'  '}
                    <i className="bi bi-device-hdd-fill" onClick={() => save()}></i>
                </Col>
                <Col md={4}>
                    <p style={editable ? { backgroundColor: 'white', margin: 'auto' } : { margin: 'auto', overflow: 'hidden' }} contentEditable={editable} suppressContentEditableWarning={true} onInput={(event) => { setBlockContent(event.target.textContent) }}>
                        {block.content}
                    </p>
                </Col>
            </Row>
        );
    } else {
        return <p>{block.content}</p>;
    }

}


function Image(props) {
    // block object fo this block and current index in the block array 
    const { block, index } = props;
    // set the content editable
    const [editable, setEditable] = useState(false);
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // onDragStart shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // onDragStart shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // onDragStart shared with useContext hook
    const saveBlock = useContext(saveBlockContext);
    // user context
    const user = useContext(UserContext);
    // condition of rendering shared with useContext hook
    const render_components = useContext(render_componentsContext);

    if (render_components) {
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='icons'>
                    <i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i>
                    {'  '}
                    <i className="bi bi-pencil-fill" onClick={() => setEditable(true)}></i>
                    {'  '}
                    <i className="bi bi-device-hdd-fill" onClick={() => { setEditable(false); saveBlock(block) }}></i>
                </Col>
                <Col md={4}>
                    <img src={IMAGE_PATH + `${block.content}`} width={500} height={300} />
                </Col>
            </Row>
        );
    } else {
        return <img src={IMAGE_PATH + `${block.content}`} width={500} height={300} />;
    }
}

export {Header,Paragraph,Image};