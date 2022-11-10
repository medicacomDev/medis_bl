import React, { useEffect,useCallback } from "react";
import NotificationAlert from "react-notification-alert";
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { atcAdded, atcGetById,getIdMarcheAtc } from "../../../Redux/atcReduce";
import { getActiveMarche } from "../../../Redux/marcheImsReduce";
import Select from "react-select";
import { useParams,useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";

function AjouterAtc() {
  const dispatch = useDispatch();
  const location = useParams();
  const navigate = useNavigate();
  if (isNaN(location.id) === true) document.title = "Ajouter un atc";
  else  document.title = "Modifier atc";
  const [nom, setNom] = React.useState("");
  const [id, setId] = React.useState(0);

  const [options, setOptions] = React.useState([
    {
      value: "",
      label: "Produit",
      isDisabled: true,
    },
  ]);
  const [marcheSelect, setMarcheSelect] = React.useState([]);

  const notificationAlertRef = React.useRef(null);

  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>{msg}</div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  function submitForm() {
    if(nom === "" || marcheSelect.length === 0)      
      notify("tr", "Vérifier vos donnée", "danger");
    else {
      dispatch(atcAdded({ nom, id,marcheSelect })).then(e=>{
        if(e.payload ===true){
          if(isNaN(location.id) === true)
            notify("tr", "Insertion avec succes", "success")
          else  
            notify("tr", "Modifier avec succes", "success");
          setTimeout(async () => {
            listeAtc();
          }, 1500);
        } else {
          notify("tr", "Problème de connexion", "danger");          
        }
      });
    }
  }
  const getMarche = useCallback(async () =>{  
    var type = await dispatch(getActiveMarche());  
    var entities = type.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.lib });
    });
    setOptions(arrayOption);
  }, [dispatch])

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
    async function getAtc() {
      if (isNaN(location.id) === false) {
        var atc = await dispatch(atcGetById(location.id));
        var marche = await dispatch(getIdMarcheAtc(location.id));
        setMarcheSelect(marche.payload.arrayOption);
        var entities = atc.payload;
        if(entities === false){
          navigate('/listAtc');
        } 
        else {
          setNom(entities.nom);
          setId(location.id);
        }
      } 
      getMarche();
    }
    getAtc();
  }, [location.id,dispatch,getMarche,navigate,verifToken]);

  function listeAtc() {
    navigate('/listAtc');
  }
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <div className="section-image">
          <Container>
            <Row>
              <Col md="12">
                <Button
                  id="saveBL"
                  className="btn-wd btn-outline mr-1 float-left"
                  type="button"
                  variant="info"
                  onClick={listeAtc}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">
                          { typeof location.id == "undefined" ? "Ajouter gamme" : "Modifier gamme" }
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom * </label>
                            <Form.Control
                              defaultValue={nom}
                              placeholder="Nom"
                              type="text"
                              onChange={(value) => {
                                setNom(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Produits* </label>
                            <Select
                              isMulti
                              placeholder="Choisir un ou plusieurs produits"
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={marcheSelect}
                              onChange={(value) => {
                                setMarcheSelect(value);
                              }}
                              options={options}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        onClick={submitForm}
                      >
                        Enregistrer
                      </Button>
                      <div className="clearfix"></div>
                    </Card.Body>
                  </Card>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
}

export default AjouterAtc;
