import { useContext, useState } from "react";
import { Container, Col } from "react-bootstrap";
import { onDragStartContext, onDragEnterContext, handleSortContext, removeBlockContext, saveBlockContext, render_componentsContext, blockDisabledContext } from './Contexts';
import { Header, Paragraph, Image } from "./Blocks";
import { BlockForm } from "./BlockManagement";

function PageContent(props) {
    // list of blocks and relative set function to manage block movements
    const { blockList, setBlockList } = props;
    // state to save source item index (the element from which the drag starts)
    const [sourceIndex, setSourceIndex] = useState(undefined);
    // state to save destination item index (the element on which the source element is dropped when dragging)
    const [destinationIndex, setDestinationIndex] = useState(undefined);
    // render_components context flag, for render_components in editing or not
    const render_components = useContext(render_componentsContext);
    // state to save the current image to modify
    const [imageEditBlock,setImageEditBlock] = useState(undefined);
    // state to handle the block editing (header/paragraph). the block editing is disabled only when i am dragging
    // this to avoid dragging image block into header/paragraph block and pasting image url inside them.
    const [disabled,setDisabled] = useState(false);

    // function to add a block to the blocklist
    function addBlock(block) {
        setBlockList((oldBlockList) => [...oldBlockList, block]);
    }

    // function to remove a block from the blockList
    function removeBlock(deletedBlock) {
        setBlockList((blockList) => blockList.filter((block) => {
            if (block.id !== deletedBlock.id) {
                return true;
            } else {
                return false;
            }
        }
        ));
    }

    // function to update the current block edit into the blockList
    function saveBlock(updatedBlock) {
        setBlockList((blockList) => blockList.map((block) => {
            if (block.id === updatedBlock.id) {
                return Object.assign({}, block, { content: updatedBlock.content });
            } else {
                return block;
            }
        }
        ));
    }

    // function to handle the drag start event
    // this event is triggered when we start dragging
    function onDragStart(event, index) {
        // disable blocks editing (start to drag)
        setDisabled(true);
        // set the start item index from which the drag event starts
        setSourceIndex(index);
    }

    // function to handle the drag enter event
    // this event is triggered when, while dragging an element, with this element we go over another one 
    function onDragEnter(event, index) {
        // set the destination item index, that is the element on which we are dragging over
        // each time this event is triggered, we save this index as potential destination index
        // potential since maybe we go over several items before releasing the mouse (dragend, see under)
        setDestinationIndex(index);
    }

    // function to handle the drag end
    // this event is triggered when we release the mouse and stop dragging
    // so here the reordering of the block list is managed
    function handleSort(event) {
        // here we reorder the list
        let reordered_list = [...blockList];
        // remove the dragged item from the list
        const dragItem = reordered_list.splice(sourceIndex, 1)[0];
        // reinsert in the destination position in the array
        reordered_list.splice(destinationIndex, 0, dragItem);
        // update coherently the block order
        reordered_list = reordered_list.map((block, index) => {
            return Object.assign({}, block, { blockOrder: index + 1 });
        });
        // update the state and reset the indexes
        setBlockList(reordered_list);
        setSourceIndex(undefined);
        setDestinationIndex(undefined);
        // enable block editing (finished to drag)
        setDisabled(false);
    }

    // each element has the draggable property to make it draggable
    // pass all the drag function as context to the elements to handle the draggingn properly
    return (
        <onDragStartContext.Provider value={onDragStart}>
            <onDragEnterContext.Provider value={onDragEnter}>
                <handleSortContext.Provider value={handleSort}>
                    <removeBlockContext.Provider value={removeBlock}>
                        <saveBlockContext.Provider value={saveBlock}>
                            <blockDisabledContext.Provider value={disabled}>
                                <>
                                    <Col md={7} className='PageContent'>
                                        {render_components ? <h2 style={{ textAlign: 'center' }}>Drag and Drop Items to Rearrange Them</h2> : ''}
                                        <Container className="blockList">
                                            {blockList.map((block, index) => {
                                                // map each block accordingly to the type
                                                switch (block.type) {
                                                    case "Header":
                                                        return <Header className='block' key={block.id} block={block} index={index} />;
                                                        break;
                                                    case "Paragraph":
                                                        return <Paragraph className='block' key={block.id} block={block} index={index} />;
                                                        break;
                                                    case "Image":
                                                        // in this case we pass also setImageEditBlock, ini case we want to edit the image of this specific block
                                                        return <Image className='block' key={block.id} block={block} index={index} setImageEditBlock={setImageEditBlock} />;
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            })}
                                        </Container>
                                    </Col>
                                    <Col md={5} className='BlockFormContent'>
                                        {/* Render or not the BLockForm component, used to Add A new Header,Paragraph,Image Block and edit an Image Block */}
                                        {render_components ? <BlockForm imageEditBlock={imageEditBlock} setImageEditBlock={setImageEditBlock} blockList={blockList} addBlock={addBlock} /> : ''}
                                    </Col>
                                </>
                            </blockDisabledContext.Provider>
                        </saveBlockContext.Provider>
                    </removeBlockContext.Provider>
                </handleSortContext.Provider>
            </onDragEnterContext.Provider>
        </onDragStartContext.Provider>
    );
}



export { PageContent };