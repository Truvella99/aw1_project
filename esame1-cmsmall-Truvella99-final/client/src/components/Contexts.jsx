import { createContext } from 'react'


/*** MAIN APPLICATION CONTEXTS ***/

// user information shared context
const UserContext = createContext(null);
// setuser function shared context
const SetUserContext = createContext(null);
// HandleError function shared context
const HandleErrorContext = createContext(null);
// setDirty function shared context
const SetDirtyContext = createContext(null);


/*** PAGE COMPONENT CONTEXT ***/

// flag to decide if render components or not shared context
// decided in page component, based un the url (add/edit/view)
const render_componentsContext = createContext(null);


/***    BLOCK MANAGEMENT CONTEXTS    ***/

// onDragStart shared context
const onDragStartContext = createContext(null);
// onDragEnter shared context
const onDragEnterContext = createContext(null);
// handleSort shared context
const handleSortContext = createContext(null);
// removeBlock shared context
const removeBlockContext = createContext(null);
// saveBlock shared context
const saveBlockContext = createContext(null);
// images shared context (uset to pass the available images of the server from page component directly to BlockForm)
// in this way we avoid to pass further props
const imagesBlockContext = createContext(null);
// block disabled flag context (from page content to Blocks (Header, Paragraph) to disable/enable editing)
// to avoid dragging image url inside the Header/Paragraph 
const blockDisabledContext = createContext(null);

export {
            UserContext,
            SetUserContext,
            HandleErrorContext,
            SetDirtyContext,
            render_componentsContext,
            onDragStartContext,
            onDragEnterContext,
            handleSortContext,
            removeBlockContext,
            saveBlockContext,
            imagesBlockContext,
            blockDisabledContext
        };