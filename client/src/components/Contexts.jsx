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
const render_componentsContext = createContext(null);


/***    BLOCK MANAGEMENT CONTEXTS    ***/

// onDragStart shared context
const onDragStartContext = createContext(null);
// onDragEnd shared context
const onDragEnterContext = createContext(null);
// handleSort shared context
const handleSortContext = createContext(null);
// handleSort shared context
const removeBlockContext = createContext(null);
// handleSort shared context
const saveBlockContext = createContext(null);
// images shared context
const imagesBlockContext = createContext(null);

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
            imagesBlockContext
        };