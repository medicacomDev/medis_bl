import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchRole } from "../../../Redux/roleReduce";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListRole() {
  document.title = "Liste des roles";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [entities, setEntities] = React.useState([]);
  function ajouter() {
    navigate('/ajouterRole');
    /* window.location.href = "/ajouterRole"; */
  }

  const getRole = useCallback(async (titre) => {
    var role = await dispatch(fetchRole());
    setEntities(role.payload);
  }, [dispatch]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if(response.payload === false){
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    getRole()
  }, [getRole,verifToken]) //now shut up eslint
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Button
              id="saveBL"
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={ajouter}
            >
              <span className="btn-label">
                <i className="fas fa-plus"></i>
              </span>
              Ajouter un role
            </Button>
          </Col>
          <Col md="12">
            <h4 className="title">Liste des roles</h4>
            <Card>
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Nom",
                      accessor: "nom",
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              navigate("/role/update/" + cell.row.values.id);
                              /* window.location.replace(
                                "/role/update/" + cell.row.values.id
                              ); */
                            }}
                            variant="warning"
                            size="sm"
                            className="text-warning btn-link edit"
                          >
                            <i className="fa fa-edit" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {entities.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListRole;
