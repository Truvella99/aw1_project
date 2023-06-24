import { useState,useContext } from "react";
import { Row,Col } from "react-bootstrap";
import { UserContext,render_componentsContext,onDragStartContext, onDragEnterContext, handleSortContext, removeBlockContext, saveBlockContext, blockDisabledContext } from "./Contexts";
import { IMAGE_PATH } from "./Costants";
import { Link } from "react-router-dom";

// component used to handle a Block of type Header
function Header(props) {
    // block object for this block and current index of the block in the block array 
    const { block, index } = props;
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // handleSort shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // removeBlock shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // saveBlock shared with useContext hook
    const saveBlock = useContext(saveBlockContext);
    // condition of rendering components or not shared with useContext hook
    const render_components = useContext(render_componentsContext);
    // disable context, used to edit the block or not
    // to avoid dragging the image url into header/paragraph blocks
    const disabled = useContext(blockDisabledContext);

    // function that handle the procedure to update the block content
    function save(new_content) {
        block.content = new_content;
        saveBlock(block);
    }

    if (render_components) {
        // allow the component to be draggable/editable
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='d-flex align-items-center justify-content-center'>
                    {/* Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                    <Link><i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i></Link>
                </Col>
                <Col md={4}>
                    <input type="text" value={block.content} style={{ backgroundColor: 'white' }} disabled={disabled} onChange={(event) => { save(event.target.value) }}/>
                </Col>
            </Row>
        );
    } else {
        // show view-only component
        return <h3>{block.content}</h3>;
    }
}

// component used to handle a Block of type Paragraph
function Paragraph(props) {
    // block object for this block and current index in the block array 
    const { block, index } = props;
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // handleSort shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // removeBlock shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // saveBlock shared with useContext hook
    const saveBlock = useContext(saveBlockContext);
    // condition of rendering components or not shared with useContext hook
    const render_components = useContext(render_componentsContext);
    // disable context, used to edit the block or not
    // to avoid dragging the image url into header/paragraph blocks
    const disabled = useContext(blockDisabledContext);

    // function that handle the procedure to update the block content
    function save(new_content) {
        block.content = new_content;
        saveBlock(block);
    }

    if (render_components) {
        // allow the component to be draggable/editable
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='d-flex align-items-center justify-content-center'>
                    {/* Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                    <Link><i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i></Link>
                </Col>
                <Col md={4}>
                    <input type="text" value={block.content} style={{ backgroundColor: 'white' }} disabled={disabled} onChange={(event) => { save(event.target.value) }}/>
                </Col>
            </Row>
        );
    } else {
        // show view-only component
        return <p>{block.content}</p>;
    }

}


// component used to handle a Block of type Image
function Image(props) {
    // block object for this block, current index in the block array
    //also, prop to set this image block for editing it, if edit icon is clicked 
    const { block, index, setImageEditBlock } = props;
    // onDragStart shared with useContext hook
    const onDragStart = useContext(onDragStartContext);
    // onDragEnter shared with useContext hook
    const onDragEnter = useContext(onDragEnterContext);
    // handleSort shared with useContext hook
    const handleSort = useContext(handleSortContext);
    // removeBlock shared with useContext hook
    const removeBlock = useContext(removeBlockContext);
    // condition of rendering components or not shared with useContext hook
    const render_components = useContext(render_componentsContext);

    if (render_components) {
        // allow the component to be draggable/editable
        return (
            <Row
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragEnter={(event) => onDragEnter(event, index)}
                onDragEnd={(event) => { handleSort(event) }}
                style={{ borderTop: '1px solid black' }}>
                <Col md={2} className='d-flex align-items-center justify-content-center'>
                    {/* Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                    <Link><i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i></Link>
                    {'  '}
                    {/* In image block also edit, since there is no inline edit here. 
                    Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                    <Link><i className="bi bi-pencil-fill" onClick={() => setImageEditBlock(block)}></i></Link>
                </Col>
                <Col md={4}>
                    <img src={IMAGE_PATH + `${block.content}`} width={250} height={150} />
                </Col>
            </Row>
        );
    } else {
        // show view-only component
        return <img style={{display: 'block', marginTop: '10px'}} src={IMAGE_PATH + `${block.content}`} width={250} height={150} />;
    }
}

export {Header,Paragraph,Image};