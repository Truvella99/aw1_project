import { useContext, useState } from "react";
import { Container, Col } from "react-bootstrap";
import { onDragStartContext, onDragEnterContext, handleSortContext, removeBlockContext, saveBlockContext, render_componentsContext } from './Contexts';
import { Header, Paragraph, Image } from "./Blocks";
import { BlockForm } from "./BlockManagement";

function PageContent(props) {
    // list of blocks and relative set function to manage block movement
    const { blockList, setBlockList } = props;
    // state to save source item index (the element on which the drag starts)
    const [sourceIndex, setSourceIndex] = useState(undefined);
    // state to save destination item index (the element on which the source element is dropped)
    const [destinationIndex, setDestinationIndex] = useState(undefined);
    // render_components context flag, for render components or not
    const render_components = useContext(render_componentsContext);
    // state to save the current image to modify
    const [imageEditBlock,setImageEditBlock] = useState(undefined);

    // function to add a block from the blocklist
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

    // function to save the current block edit into the blockList
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

    // function to handle the drag start
    function onDragStart(event, index) {
        // set the start item index
        setSourceIndex(index);
    }

    // function to handle the drag enter (su quale elemento andiamo col drag item su quali altri items)
    function onDragEnter(event, index) {
        // set the destination item index
        setDestinationIndex(index);
    }

    // function to handle the drag end, and so the reordering of the list (when we release the mouse)
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
    }

    // each element has the draggable property to make it draggable
    return (
        <onDragStartContext.Provider value={onDragStart}>
            <onDragEnterContext.Provider value={onDragEnter}>
                <handleSortContext.Provider value={handleSort}>
                    <removeBlockContext.Provider value={removeBlock}>
                        <saveBlockContext.Provider value={saveBlock}>
                            <>
                                <Col md={7} className='PageContent'>
                                    {render_components ? <h2 style={{ textAlign: 'center' }}>Drag and Drop Items to Rearrange Them</h2> : ''}
                                    <Container className="blockList">
                                        {blockList.map((block, index) => {
                                            switch (block.type) {
                                                // use index to map instead of block.id since when adding a new block we have to create a temporary id,
                                                // (blockList.lenght + 1) that could be in conflict with original block.id. Since here we don't care
                                                // about block.id we use index (will be the server that will create them (Add page from scratch,
                                                // Edit page delete them and then recreate them).
                                                case "Header":
                                                    return <Header className='block' key={block.id} block={block} index={index} />;
                                                    break;
                                                case "Paragraph":
                                                    return <Paragraph className='block' key={block.id} block={block} index={index} />;
                                                    break;
                                                case "Image":
                                                    return <Image className='block' key={block.id} block={block} index={index} setImageEditBlock={setImageEditBlock}/>;
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })}
                                    </Container>
                                </Col>
                                <Col md={5} className='BlockFormContent'>
                                    { render_components ? <BlockForm imageEditBlock={imageEditBlock} setImageEditBlock={setImageEditBlock} blockList={blockList} addBlock={addBlock} /> : ''}
                                </Col>
                            </>
                        </saveBlockContext.Provider>
                    </removeBlockContext.Provider>
                </handleSortContext.Provider>
            </onDragEnterContext.Provider>
        </onDragStartContext.Provider>
    );
}



export { PageContent };