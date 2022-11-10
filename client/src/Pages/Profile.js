import React,{useCallback} from "react";
import NotificationAlert from "react-notification-alert";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { profilUpdated,userGetById } from "../Redux/usersReduce";
import { useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { verification } from "../Redux/usersReduce";

function Profile() {
  const dispatch = useDispatch();
  var token = localStorage.getItem("x-access-token");
  var id = 0;
  if(token != null){
    var decoded = jwt_decode(token);
    id = decoded.id;
  }
  const [nom, setNom] = React.useState("");
  const [tel, setTel] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const notificationAlertRef = React.useRef(null);
  const notify = (place, type, message) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  function submitForm(event) {
    if (
      nom === "" ||
      login === "" ||
      (password !== "" && password.length < 6)
    ) {
      notify("tr", "danger", "Toutes les données sont obligatoires");
    } else {
      notify("tr", "success", "Modifier avec succes");
      dispatch(profilUpdated({ nom, tel, login, password, id }));
    }
  }
  const getDetail = useCallback(async () => {
    var response = await dispatch(userGetById(id));
    var res =await response.payload;
    setNom(res.nomU);
    setLogin(res.login);
    setTel(res.tel);
  }, [dispatch,id]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if(response.payload === false){
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);
  React.useEffect(() => {
    verifToken();
    getDetail();
  }, [getDetail,verifToken]);
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <div className="section-image" >
          <Container>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">Mon profil</Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
          
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom* </label>
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
                            <label>Telephone </label>
                            <Form.Control
                              defaultValue={tel}
                              placeholder="Telephone"
                              type="text"
                              onChange={(value) => {
                                setTel(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Login*</label>
                            <Form.Control
                              id="Login_user"
                              defaultValue={login}
                              placeholder="Login"
                              type="text"
                              onChange={(value) => {
                                setLogin(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Mot de passe* (6 chiffre minimum)</label>
                            <Form.Control
                              id="mdp_user"
                              defaultValue=""
                              placeholder="Mote de passe"
                              type="password"
                              onChange={(value) => {
                                setPassword(value.target.value);
                              }}
                            ></Form.Control>
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

export default Profile;
