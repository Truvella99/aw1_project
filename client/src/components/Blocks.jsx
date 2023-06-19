import { useState,useContext } from "react";
import { Row,Col } from "react-bootstrap";
import { UserContext,render_componentsContext,onDragStartContext, onDragEnterContext, handleSortContext, removeBlockContext, saveBlockContext, blockDisabledContext } from "./Contexts";
import { IMAGE_PATH } from "./Costants";
import { Link } from "react-router-dom";

function Header(props) {
    // block object fo this block and current index in the block array 
    const { block, index } = props;
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
    // condition of rendering shared with useContext hook
    const render_components = useContext(render_componentsContext);
    // editable context to edit the block or not
    const disabled = useContext(blockDisabledContext);

    // function that handle the procedure to save the block
    function save(new_content) {
        block.content = new_content;
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
        return <h3>{block.content}</h3>;
    }
}

function Paragraph(props) {
    // block object fo this block and current index in the block array 
    const { block, index } = props;
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
    // condition of rendering shared with useContext hook
    const render_components = useContext(render_componentsContext);
    // editable context to edit the block or not
    const disabled = useContext(blockDisabledContext);

    // function that handle the procedure to save the block
    function save(new_content) {
        block.content = new_content;
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
        return <p>{block.content}</p>;
    }

}


function Image(props) {
    // block object fo this block, current index in the block array and prop to set this block as edit image block if edit is clicked 
    const { block, index, setImageEditBlock } = props;
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
                <Col md={2} className='d-flex align-items-center justify-content-center'>
                    {/* Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                    <Link><i className="bi bi-trash-fill" onClick={() => removeBlock(block)}></i></Link>
                    {'  '}
                    {/* Here no setDirty to refresh data, in order to avoid that while i am editing the page maybe an admin
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
        return <img style={{display: 'block', marginTop: '10px'}} src={IMAGE_PATH + `${block.content}`} width={250} height={150} />;
    }
}

export {Header,Paragraph,Image};