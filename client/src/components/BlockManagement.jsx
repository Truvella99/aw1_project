import { useParams } from "react-router-dom";
import { ButtonGroup, Button, Carousel } from "react-bootstrap";
import { useContext, useState } from "react";
import API from "../API";
import { HandleErrorContext } from "./Contexts";
import { IMAGE_PATH } from "./Costants";

function BlockForm(props) {
    // id of the page to be fetched
    const pageId = useParams().id;
    // function to handle errors
    const handleError = useContext(HandleErrorContext);
    // function to add a new block to the blockList
    const { addBlock, blockList } = props;
    // state to render or not the choice of the images, depending if add Image has been clicked or not
    const [showImages, setShowImages] = useState(false);
    // state to mantain all the images available
    const [images, setImages] = useState([]);
    // temporary client id for visualization
    const [tempId,setTempId] = useState(blockList.length + 1);
    // function to add an empty Header block to the blockList
    function addHeader() {
        // temporary client id just for visualization, when sended to the server will be removed and created by the db
        const newTempId = tempId;
        setTempId((oldTempId) => oldTempId + 1);
        // create an empty header block and pass it to the addHeader function
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
        // create an empty header block and pass it to the addHeader function
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
    function addImage(image) {
        // temporary client id just for visualization, when sended to the server will be removed and created by the db
        const newTempId = tempId;
        setTempId((oldTempId) => oldTempId + 1);
        // create an empty header block and pass it to the addHeader function
        const block = {
            id: newTempId,
            pageId: pageId,
            type: 'Image',
            content: image,
            // it does not matter, since the order of blocks when submitting will be the index+1 inside the blocklist
            blockOrder: undefined
        };
        addBlock(block);
    }

    // call the API to display the images for choice
    async function retrieveAllImages() {
        try {
            const images = await API.getAllImages();
            setImages(images);
            // set view to choice image visible
            setShowImages(true); 
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <>
            <ButtonGroup aria-label="Basic example">
                <Button variant="primary" onClick={() => addHeader()}>Add Header</Button>
                <Button variant="success" onClick={() => addParagraph()}>Add Paragraph</Button>
                <Button variant="info" onClick={() => retrieveAllImages()}>Add Image</Button>
            </ButtonGroup>
            {showImages ?
                <>
                    <h4>Click on One Image to select it</h4>
                    <Carousel style={{ width: '500px', height: '300px' }}>
                        {images.map((image, index) => {
                            return <Carousel.Item key={index}>
                                <img src={IMAGE_PATH + `${image}`} onClick={() => {addImage(image)}} width={500} height={300} />
                            </Carousel.Item>;
                        })}
                    </Carousel>
                </>
            : ''}
        </>
    );
}

export { BlockForm };