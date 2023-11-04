import { useParams } from "react-router-dom";
import { ButtonGroup, Button, Carousel } from "react-bootstrap";
import { useContext, useState } from "react";
import API from "../API";
import { saveBlockContext,imagesBlockContext } from "./Contexts";
import { IMAGE_PATH } from "./Costants";

// Component Used to Add A new Header,Paragraph,Image Block and edit an Image Block
function BlockForm(props) {
    // id of the page to be fetched
    const pageId = useParams().id;
    // array of images content passed by context
    const images = useContext(imagesBlockContext);
    // function to update a block
    const saveBlock = useContext(saveBlockContext);
    // function to add a new block to the blockList and the current blockList
    const { addBlock, blockList } = props;
    // function to view the selected editImageBlock (when we click the pen icon near the image) and to reset it once edited
    const {imageEditBlock, setImageEditBlock} = props;
    // state used to render or not the choice of the images, depending if add Image or pen icon near image has been clicked or not
    const [showImages, setShowImages] = useState(false);
    // temporary client id for visualization (find the max id in the blockList array and add 1)
    const [tempId,setTempId] = useState(blockList.reduce((max, obj) => (obj.id > max ? obj.id : max), 0) + 1);
    
    // function to add an empty Header block to the blockList
    function addHeader() {
        // temporary client id just for visualization, when sended to the server will be removed and created by the db
        const newTempId = tempId;
        setTempId((oldTempId) => oldTempId + 1);
        // create an empty header block and pass it to the addBlock function
        const block = {
            id: newTempId,
            pageId: pageId,
            type: 'Header',
            content: '',
            // it does not matter, since the order of blocks when submitting will be the index+1 inside the blocklist
            blockOrder: undefined
        };
        addBlock(block);
    }

    // function to add an empty Paragraph block to the blockList
    function addParagraph() {
        // temporary client id just for visualization, when sended to the server will be removed and created by the db
        const newTempId = tempId;
        setTempId((oldTempId) => oldTempId + 1);
        // create an empty Paragraph block and pass it to the addBlock function
        const block = {
            id: newTempId,
            pageId: pageId,
            type: 'Paragraph',
            content: '',
            // it does not matter, since the order of blocks when submitting will be the index+1 inside the blocklist
            blockOrder: undefined
        };
        addBlock(block);
    }

    // function to add an empty Image block to the blockList
    function addEditImage(image) {
        // disable image viewing
        setShowImages(false);
        if (!imageEditBlock) {
            // no edit was setted, so add a new image
            // temporary client id just for visualization, when sended to the server will be removed and created by the db
            const newTempId = tempId;
            setTempId((oldTempId) => oldTempId + 1);
            // create an empty header block and pass it to the addBlock function
            const block = {
                id: newTempId,
                pageId: pageId,
                type: 'Image',
                content: image,
                // it does not matter, since the order of blocks when submitting will be the index+1 inside the blocklist
                blockOrder: undefined
            };
            addBlock(block);
        } else {
            // edit was setted, so edit current image
            // update edit of the selected imageBlock
            const updated_block = Object.assign({},imageEditBlock,{content: image});
            saveBlock(updated_block);
            // clear the edit state, no image edit is now selected
            setImageEditBlock(undefined);
        }
    }

    return (
        <>
            <ButtonGroup aria-label="Basic example">
                {/* Here no setDirty to rehydrate data, in order to avoid that while i am editing the page maybe an admin
                    change page title,author or publication date
                    and i lost all the edit that i was doing */}
                <Button variant="primary" onClick={() => addHeader()}>Add Header</Button>
                <Button variant="success" onClick={() => addParagraph()}>Add Paragraph</Button>
                <Button variant="info" onClick={() => {
                    setShowImages(true);
                    /* give priority to the user action if press add image after edit an image block */
                    setImageEditBlock(undefined);
                }}>Add Image</Button>
            </ButtonGroup>
            { //render if we want to add a new image (showImage) or we have click edit icon on an already existing one (so imageEditBlock not undefined)
            (showImages || imageEditBlock!==undefined) ?
                <>
                    <h4>Click on One Image to select it</h4>
                    <Carousel style={{ width: '250px', height: '150px' }}>
                        { /* Each image is built from the base url, + the block content */
                        images.map((image, index) => {
                            return <Carousel.Item key={index}>
                                <img src={IMAGE_PATH + `${image}`} onClick={() => {addEditImage(image)}} width={250} height={150} />
                            </Carousel.Item>;
                        })}
                    </Carousel>
                </>
            : ''}
        </>
    );
}

export { BlockForm };