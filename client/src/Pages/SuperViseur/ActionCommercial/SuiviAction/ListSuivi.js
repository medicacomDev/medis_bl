import { Card, Container, Row, Col, Button, Form } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { getBlByClientRest } from "../../../../Redux/blReduce";
import { getActionCloturer,fetchAction } from "../../../../Redux/actionReduce";
import { getAllParmacieCmd } from "../../../../Redux/commandesReduce";
import { useParams, useNavigate } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import { verification } from "../../../../Redux/usersReduce";
import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import { useDispatch } from "react-redux";
import Select from "react-select";
import jwt_decode from "jwt-decode";

// core components
function ListSuivi() {
  document.title = "Liste des suivis";
  var annee = localStorage.getItem("annee");
  var token = localStorage.getItem("x-access-token");
  var decoded = jwt_decode(token);
  const [action, setAction] = React.useState({
    value: 0,
    label: "Tous",
  });
  const [optionsAction, setOptionsAction] = React.useState([
    {
      value: "",
      label: "Action",
      isDisabled: true,
    },
  ]);
  const [client, setClient] = React.useState({
    value: 0,
    label: "Tous",
  });
  const [optionsClient, setOptionsClient] = React.useState([
    {
      value: "",
      label: "Client",
      isDisabled: true,
    },
  ]);
  const idLine = decoded.line;
  const idRole = decoded.idrole;
  const navigate = useNavigate();
  const location = useParams();
  const notificationAlertRef = React.useRef(null);
  var id = location.id;
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);

  const getAction = useCallback(async () => {
    var act = await dispatch(getActionCloturer({ idLine, idRole, annee }));
    var res = act.payload;
    var arrayOption = [];
    res.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    var act1 = await dispatch(fetchAction({ idLine, idRole, annee }));
    var res1 = act1.payload;
    res1.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
    });
    if(arrayOption.length >0){
      setAction(arrayOption[0]);      
      getClient(arrayOption[0].value,0);
    }
    setOptionsAction(arrayOption);
  }, [dispatch]);

  const getClients = useCallback(async () => {
    var act = await dispatch(getAllParmacieCmd());
    var res = await act.payload;
    setOptionsClient(res);
  }, [dispatch]);

  const getClient = useCallback(
    async (idAction,idClient) => {
      var client = await dispatch(getBlByClientRest({ idAction,idClient, annee }));
      setEntities(client.payload);
    },
    [dispatch]
  );

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    getAction();
    verifToken();
    getClients();
  }, [getClient, getAction, verifToken]); //now shut up eslint

  function listActions() {
    navigate("/listAction");
    /* window.location.replace("/listAction"); */
  }
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="6">
            <Form.Group>
              <label>Action* </label>
              <Select
                className="react-select primary"
                classNamePrefix="react-select"
                value={action}
                onChange={(value) => {
                  setAction(value);
                  getClient(value.value,client.value);
                }}
                options={optionsAction}
              />
            </Form.Group>
          </Col>
          <Col md="6">
            <Form.Group>
              <label>Client* </label>
              <Select
                className="react-select primary"
                classNamePrefix="react-select"
                value={client}
                onChange={(value) => {
                  setClient(value);
                  getClient(action.value,value.value);
                }}
                options={optionsClient}
              />
            </Form.Group>
          </Col>
        </Row>
        <Card className="table-visualisation-action">
          <Card.Body>
            <ReactTable
              data={entities}
              columns={[
                {
                  Header: "Pharmacie",
                  accessor: "nomClient",
                },
                {
                  Header: "objectif",
                  accessor: "objectif",
                },
                {
                  Header: "Détail",
                  accessor: "id",
                  Cell: ({ cell }) => (
                    <div className="block-action">
                      <Button
                        className="message"
                        onClick={(e) => {
                          localStorage.setItem("returnVis", "/suivie");                          
                          navigate("/detailVisualisation/"+cell.row.original.idAction+"/"+cell.row.original.id);
                        }}
                        variant="success"
                        size="sm"
                      >
                        Détail <i
                          className="fa fa-eye"
                          id={"idLigne_" + cell.row.values.id}
                        />
                      </Button>
                    </div>
                  ),
                },
                {
                  Header: "bl",
                  accessor: "",
                  Cell: ({ cell }) => (
                    <div className="block-action">
                      <Button
                        className="message"
                        onClick={(e) => {
                          localStorage.setItem("returnVis", "/suivie");                          
                          /* navigate("/detailVisualisation/"+cell.row.original.idAction+"/"+cell.row.original.id); */
                          navigate("/detailSuivi/" + cell.row.original.id+"/"+cell.row.original.idAction);
                        }}
                        variant="success"
                        size="sm"
                      >
                        Visualiser <i
                          className="fa fa-eye"
                          id={"idLigne_" + cell.row.values.id}
                        />
                      </Button>
                    </div>
                  ),
                },
                {
                  Header: "b",
                  accessor: "",
                },
              ]}
            />
            {entities.length === 0 ? (
              <div className="text-center">Aucun donnée trouvé</div>
            ) : (
              ""
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default ListSuivi;
