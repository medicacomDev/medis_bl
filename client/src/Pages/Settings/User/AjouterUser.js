import React, { useEffect,useCallback } from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import validator from "validator";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { userAdded, userGetById, verification, getSuperviseur } from "../../../Redux/usersReduce";
import { fetchRole } from "../../../Redux/roleReduce";
import { getActiveLigne } from "../../../Redux/ligneImsReduce";
import { getActiveSecteur } from "../../../Redux/secteurReduce";
import { useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { useParams,useNavigate } from "react-router-dom";

function AjouterUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  var token = localStorage.getItem("x-access-token");
  const location = useParams();
  if (isNaN(location.id) === true) document.title = "Ajouter un utilisateur";
  else  document.title = "Modifier l'utilisateur";
  var decoded = jwt_decode(token);
  var idrole = decoded.idrole;
  var idLine = decoded.line;
  var idUser = decoded.id;
  //input
  const [nomU, setNomU] = React.useState("");
  const [prenomU, setPrenomU] = React.useState("");
  const [tel, setTel] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [crm, setCrm] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState(0);
  const [id, setId] = React.useState(0);
  const [ligne, setLigne] = React.useState(0);
  const [secteur, setSecteur] = React.useState(0);
  //required
  const etat = 1;
  const notificationAlertRef = React.useRef(null);

  const [options, setOptions] = React.useState([
    {
      value: "",
      label: "Role",
      isDisabled: true,
    },
  ]);
  const [roleSelect, setRoleSelect] = React.useState({
    value: 0,
    label: "Role",
  });

  const [optionsLigne, setOptionsLigne] = React.useState([
    {
      value: "",
      label: "Réseau",
      isDisabled: true,
    },
  ]);
  const [ligneSelect, setLigneSelect] = React.useState({
    value: 0,
    label: "Réseau",
  });

  // Secteur
  const [optionsSecteur, setOptionsSecteur] = React.useState([
    {
      value: "",
      label: "Secteur",
      isDisabled: true,
    },
  ]);
  const [secteurSelect, setSecteurSelect] = React.useState({
    value: 0,
    label: "Secteur",
  });

  // User
  const [optionsUser, setOptionsUser] = React.useState([
    {
      value: "",
      label: "User",
      isDisabled: true,
    },
  ]);
  const [userSelect, setUserSelect] = React.useState({
    value: 0,
    label: "Superviseur",
  });

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
  function submitForm(event) {
    
    var required = document.getElementsByClassName("required");
    var testPassword = true;
    for (var i = 0; i < required.length+1; i++) {  
      if(required[i] !== undefined){
        document.getElementsByClassName("error")[i].innerHTML="";  
        //condition required      
        if (validator.isEmpty(required[i].value) && required[i].name !=="Password" ) {
          document.getElementsByClassName("error")[i].innerHTML=required[i].name+" est obligatoire";
          notify("tr", required[i].name + " doit être non vide", "danger");     
        } 
        //condition email
        else if(required[i].name ==="Email" && !validator.isEmail(required[i].value)){
          notify("tr", "E-mail invalide", "danger");
          document.getElementsByClassName("error")[i].innerHTML="E-mail invalide";
        }
        //condition password
        else if( (required[i].name ==="Password" && isNaN(location.id) === true) ||
        (required[i].name ==="Password" && !validator.isEmpty(required[i].value) && isNaN(location.id) === false) ){
          if (!validator.isLength(required[i].value,{min:6, max: 20})) {
            testPassword = false;
            notify("tr", "Password doit être minimum 6 charactére", "danger");
            document.getElementsByClassName("error")[i].innerHTML="Password doit être minimum 6 charactére";
          }
        }
      }
    }
    var testSuper = true;

    var id_parent = role === 2 ? userSelect.value:null;
    if(role === 2 && id_parent === 0){
      testSuper=false
    }

    if(!testSuper){
      notify("tr", "Superviseur est obligatoire", "danger");
    }
    else if (
      !validator.isEmpty(nomU) &&
      !validator.isEmpty(prenomU) &&
      validator.isEmail(email) &&
      !validator.isEmpty(login) &&
      testPassword === true &&
      (secteur >0)
    ) {
      dispatch(userAdded({ nomU, prenomU, email, tel, login, password, id, etat, role, ligne, secteur, crm, id_parent })).then(e=>{
        if(e.payload ===true){
          if(isNaN(location.id) === true)
            notify("tr", "Insertion avec succes", "success")
          else  
            notify("tr", "Modifier avec succes", "success");
          setTimeout(async () => {
            listeUser();
          }, 1500);
        } else {
          notify("tr", "Problème de connexion", "danger");          
        }
      });
    } else {
      notify("tr", "Vérifier vos donnée", "danger");    
    }
  }

  const getLigne = useCallback(async (p) =>{  
    var ligne = await dispatch(getActiveLigne());  
    var entities = ligne.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom });
      if (e.id === p) {
        setLigneSelect({ value: e.id, label: e.nom });
      }
    });
    setOptionsLigne(arrayOption);
  }, [dispatch])

  const getSecteur = useCallback(async (p) =>{  
    var sect = await dispatch(getActiveSecteur());  
    var entities = sect.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.libelleSect });
      if (e.id === p) {
        setSecteurSelect({ value: e.id, label: e.libelleSect });
      }
    });
    setOptionsSecteur(arrayOption);
  }, [dispatch])

  const getUser = useCallback(async () =>{  
    var user = await dispatch(getSuperviseur());  
    var entities = user.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nomU +" "+ e.prenomU });
    });
    setOptionsUser(arrayOption);
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
    async function getRole(p) {
      var role = await dispatch(fetchRole(token));
      var entities = role.payload;
      var arrayOption = [];
      arrayOption.push({ value: 0, label: "Role" });
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom });
        if (e.id === p) {
          setRoleSelect({ value: e.id, label: e.nom });
        }
      });
      if(idrole === 1){
        setRole(2)
        setLigne(idLine);        
        setUserSelect({ value: idUser, label: idUser });
      }
      setOptions(arrayOption);
    }
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (isNaN(location.id) === false) {
          var user = await dispatch(userGetById(location.id));
          var entities = user.payload;
          if(entities === false){
            navigate('/utilisateurListe');
          } 
          else {
            setCrm(entities.crm)
            setNomU(entities.nomU);
            setPrenomU(entities.prenomU);
            setEmail(entities.email);
            setLogin(entities.login);
            setTel(entities.tel);
            setRole(entities.idrole);
            setSecteur(entities.idsect);
            setLigne(entities.line)
            setId(location.id);
            resolve(entities);
          }
        } else {
          resolve(0);
        }
      }, 300);
    });

    promise.then((value) => {
      getUser();
      if(value!==0){
        getRole(value.idrole);
        getLigne(value.line);
        getSecteur(value.idsect)
      } else {
        getRole(0);
        getLigne(0);
        getSecteur(0);
      }
    });
  }, [location.id,dispatch,token,getLigne,getSecteur,idLine,idrole,navigate,verifToken]);

  function listeUser() {
    navigate('/utilisateurListe');
    /* window.location.replace("/utilisateurListe"); */
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
                  onClick={listeUser}
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
                          {typeof location.id == "undefined"
                            ? "Ajouter utilisateur"
                            : "Modifier utilisateur"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>CODE CRM </label>
                            <Form.Control
                              defaultValue={crm}
                              placeholder="CODE CRM"
                              type="text"
                              onChange={(value) => {
                                setCrm(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Secteur* </label>
                            <Select
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={secteurSelect}
                              onChange={(value) => {
                                setSecteurSelect(value);
                                setSecteur(value.value);
                              }}
                              options={optionsSecteur}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom* </label>
                            <Form.Control
                              defaultValue={nomU}
                              placeholder="Nom"
                              name="Nom"
                              className="required"
                              type="text"
                              onChange={(value) => {
                                setNomU(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Prenom* </label>
                            <Form.Control
                              defaultValue={prenomU}
                              placeholder="Prenom"
                              name="Prenom"
                              className="required"
                              type="text"
                              onChange={(value) => {
                                setPrenomU(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Login* </label>
                            <Form.Control
                              autoComplete="off"
                              defaultValue={login}
                              placeholder="Login"
                              className="required"
                              name="Login"
                              type="text"
                              onChange={(value) => {
                                setLogin(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Password* </label>
                            <Form.Control
                              autoComplete="off"
                              defaultValue={password}
                              placeholder="Password"
                              className="required"
                              name="Password"
                              type="password"
                              onChange={(value) => {
                                setPassword(value.target.value);
                              }}
                            ></Form.Control>
                            <div className="error"></div>
                          </Form.Group>
                        </Col>

                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Téléphone </label>
                            <Form.Control
                              defaultValue={tel}
                              placeholder="Téléphone"
                              type="number"
                              onChange={(value) => {
                                setTel(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>E-mail* </label>
                            <Form.Control
                              defaultValue={email}
                              placeholder="E-mail"
                              name="Email"
                              className="required"
                              type="text"
                              onChange={(value) => {
                                setEmail(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                        </Col>
                      </Row>
                      {parseInt(idrole) === 0?
                        <Row>
                          <Col className="pr-1" md="6">
                            <Form.Group>
                              <label>Role* </label>
                              <Select
                                className="react-select primary"
                                classNamePrefix="react-select"
                                value={roleSelect}
                                onChange={(value) => {
                                  setRoleSelect(value);
                                  setRole(value.value);
                                }}
                                options={options}
                              />
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="6">
                            <Form.Group>
                              <label>Réseau* </label>
                              <Select
                                className="react-select primary"
                                classNamePrefix="react-select"
                                value={ligneSelect}
                                onChange={(value) => {
                                  setLigneSelect(value);
                                  setLigne(value.value);
                                }}
                                options={optionsLigne}
                              />
                            </Form.Group>
                          </Col>
                          <Col className="pr-1" md="6">
                            <Form.Group autoComplete="off" >
                              <label>Superviseur </label>
                              <Select
                                autoComplete="off" 
                                name="super"
                                className="react-select primary"
                                classNamePrefix="react-select"
                                value={userSelect}
                                onChange={(value) => {
                                  setUserSelect(value);
                                }}
                                options={optionsUser}
                              />
                            </Form.Group>
                          </Col>
                      </Row>
                      :""}
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

export default AjouterUser;
