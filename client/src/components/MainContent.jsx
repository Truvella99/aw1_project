import { Container,ListGroup,Alert,Spinner } from 'react-bootstrap';
import { useState } from 'react';
import { NavHeader } from './Navbar';

function Loading(props) {
    return (
      <Container fluid><Spinner className='m-2' animation="border" role="status" /></Container>
    )
}

function ListOfPages(props) {
    const [pageList,setPageList] = useState([]);

    return (
      <>
        <NavHeader/>
        {initialLoading ? <Loading /> :
          <>
            <ListGroup>
              {backendError ? <Alert variant='danger' onClose={() => setBackendError('')} dismissible>{backendError}</Alert> :
                library.map((film) => {
                  return <FilmComponent state={props.state} setLibrary={setLibrary} editRating={props.editRating} editFavorite={props.editFavorite} deleteFilm={props.deleteFilm} setEditFilm={props.setEditFilm} film={film} key={film.id} />
                })}
            </ListGroup>
          </>
        }
      </>
  );
  }