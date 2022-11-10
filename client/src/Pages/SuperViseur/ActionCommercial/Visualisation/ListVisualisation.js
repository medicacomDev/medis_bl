import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import { Card, Container, Row, Col, Form, Button } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import {
  getClientSegmentById,
  getAllClientSeg,
} from "../../../../Redux/segmentReduce";
import { getActionById } from "../../../../Redux/actionReduce";
import {
  commandeAdded,
  getAllCommande,
  getCommandeByEtat,
  totalCaByAction,
} from "../../../../Redux/commandesReduce";
import { useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import { getIdSecteurIms } from "../../../../Redux/secteurReduce";
import { verification } from "../../../../Redux/usersReduce";
import { packGetById } from "../../../../Redux/packReduce.js";
import TableAtc from "./TableAtc.js";

// core components
function ListVisualisation() {
  document.title = "Liste des actions";
  const navigate = useNavigate();
  const location = useParams();
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
  var token = localStorage.getItem("x-access-token");
  localStorage.removeItem("commentaire");
  var decoded = jwt_decode(token);
  var idUser = decoded.id;
  const idRole = decoded.idrole;
  const idSect = decoded.idsect;
  var id = location.id;
  const idLine = location.idLine;
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);
  const [entitiesEnCours, setEntitiesEnCours] = React.useState([]);
  const [caPharmacie, setCaPharmacie] = React.useState([]);
  const [idBls, setIdBls] = React.useState([]);
  const [commande, setCommande] = React.useState([]);
  const [commandeR, setCommandeR] = React.useState([]);
  const [nom, setNom] = React.useState("");
  const [objectif, setObjectif] = React.useState("");
  const [dateDebut, setDateDebut] = React.useState("");
  const [dateFin, setDateFin] = React.useState("");
  const [pack, setPack] = React.useState([]);
  const [countBl, setCountBl] = React.useState("");
  const [alert, setAlert] = React.useState(null);
  const [testDate, setTestDate] = React.useState(true);
  const getCommentaire = useCallback(async (commentaire) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={"Note"}
        onConfirm={() => hideAlert()}
        cancelBtnBsStyle="danger"
      >
        {commentaire !== "" && commentaire !== null
          ? commentaire
          : "Aucune note"}
      </SweetAlert>
    );
  }, []);

  const confirmMessage = (event, ligne) => {
    var check = event;
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={
          parseInt(check) === 1 || parseInt(check) === 3
            ? "Commande accepter"
            : "Commande réfuser"
        }
        onConfirm={() => submitForm(check, ligne)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
        <div>
          <Form.Group className="input-comment">
            <label>Note</label>
            <textarea
              className="form-control"
              onChange={(value) => {
                localStorage.setItem("commentaire", value.target.value);
              }}
              rows="5"
            ></textarea>
          </Form.Group>
        </div>
      </SweetAlert>
    );
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const getSegment = useCallback(
    async (list) => {
      var dd = list.date_debut;
      var df = list.date_fin;
      var idSeg = "(" + list.idSegment + ")";
      var secteur = await dispatch(getIdSecteurIms(idSect));
      var idBricks = secteur.payload;
      var res = null;
      var test = false;
      const arraySplit = list.idSegment.split(",");
      arraySplit.forEach((element) => {
        if (parseInt(element) === 0) test = true;
      });
      if (idRole === 2) {
        if (test === false){
          res = await dispatch(
            getClientSegmentById({
              idSeg,
              idRole,
              idBricks,
              dd,
              df,
              id,
              idUser,
            })
          );
        }
        else{
          res = await dispatch(
            getAllClientSeg({ idSeg, idRole, idBricks, dd, df, id, idUser })
          );
        }
        setEntities(res.payload.rows);
        setCaPharmacie(res.payload.objClient);
        setIdBls(res.payload.objBl)
      }
      var res1 = await dispatch(getCommandeByEtat({ id, idUser, idRole }));
      setEntitiesEnCours(res1.payload.rows);
    },
    [dispatch, idRole, idSect, id]
  );

  const getCommande = useCallback(async () => {
    var res = await dispatch(getAllCommande(id));
    var findCmd = await res.payload.findCmd;
    var findCmdR = await res.payload.findCmdR;
    setCommande(findCmd);
    setCommandeR(findCmdR);
  }, []);

  const getTotal = useCallback(
    async () => {
      /* var total = await dispatch(
        totalCaByPack({
          idPacks: entities.idPacks,
          dateDebut: entities.date_debut,
          dateFin: entities.date_fin,
          idLine: idLine,
        })
      ); */
      var total = await dispatch(totalCaByAction(id));
      setCountBl(total.payload.mntTotal);
    },
    [dispatch, idLine]
  );

  const getAction = useCallback(async () => {
    var today = new Date();
    var action = await dispatch(getActionById(id));
    var result = action.payload;
    if (result.length === 0) {
      setTimeout(() => {
        navigate("/listAction");
      }, 1000);
    } else {
      var entities = result[0];
      var dateD = new Date(entities.date_debut); // Or the date you'd like converted.
      var dateDD = new Date(dateD.getTime() - dateD.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      var dateF = new Date(entities.date_fin); // Or the date you'd like converted.
      var dateFF = new Date(dateF.getTime() - dateF.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      if (
        dateF.getTime() <= today.getTime() ||
        dateD.getTime() >= today.getTime()
      ) {
        setTestDate(false);
      }
      setNom(entities.nom);
      setObjectif(entities.objectif);
      setDateDebut(dateDD);
      setDateFin(dateFF);
      var groupPacks = entities.groupPacks.split(",");
      setPack(groupPacks);
      getSegment(entities);
      getTotal(entities);
    }
  }, [dispatch, id, getSegment, getTotal, navigate]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    getAction();
    getCommande();
  }, [getAction, getCommande, verifToken]); //now shut up eslint

  function listActions() {
    navigate("/listAction");
  }
  function submitForm(event, ligne) {
    var note = localStorage.getItem("commentaire");
    /* var splitBl = idBls[ligne.id_pharmacie].split(",");
    var arrayCmd = [];
    if(event === 3) {
      splitBl.forEach(val=>{
        arrayCmd.push({
          id_cmd:ligne.id,
          id_bl:val,
        })
      })
    } */
    dispatch(
      commandeAdded({
        etat: event,
        total: caPharmacie[ligne.id_pharmacie],
        idBls: idBls[ligne.id_pharmacie],
        id_pharmacie: ligne.id_pharmacie,
        id_segment: ligne.Segment,
        id_user: idUser,
        note: note,
        id_action: id,
        id_cmd: event >2?ligne.id:0,
      })
    ).then((data) => {
      var ch = "Clôturer avec succès";
      switch (data.payload) {
        case 200:
          notify("tr", ch, "success");
          break;
        case 400:
          notify("tr", "Vérifier vos données", "danger");
          break;
        default:
          break;
      }
      getAction();
      getCommande();
      setTimeout(() => {
        getAction();
        getCommande();
      }, 1500);
      hideAlert();
    });
  }

  const pop_up = useCallback(
    async (id) => {
      var value = await dispatch(packGetById(id));
      var headerPacks = await value.payload.header;
      var tablePacks = await value.payload.table;
      setAlert(
        <SweetAlert
          customClass="pop-up-packs"
          style={{ display: "block", marginTop: "-100px" }}
          title={"Détail pack " + headerPacks.nom}
          onConfirm={() => hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
          confirmBtnText="Oui"
          cancelBtnText="Non"
        >
          <table className="table-hover table">
            <thead>
              <tr className="tr-pack">
                <th>nom</th>
                <th>bonification</th>
                <th>date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{headerPacks.nom}</td>
                <td>{headerPacks.bonification}</td>
                <td>{headerPacks.date}</td>
              </tr>
            </tbody>
          </table>

          <TableAtc entities={tablePacks}></TableAtc>
        </SweetAlert>
      );
    },
    [dispatch]
  );

  function GroupPacks({ groupPacks }) {
    /* var gp = groupPacks.split(",") */
    var span = [];
    groupPacks.map((val, key) => {
      var res = val.split("@");
      span.push(
        <span
          className="pack_action"
          key={"pack" + key}
          onClick={() => {
            pop_up(res[1]);
          }}
        >
          {res[0]},{" "}
        </span>
      );
    });
    return span;
  }
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <Button
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={listActions}
            >
              <span className="btn-label">
                <i className="fas fa-list"></i>
              </span>
              Retour à la liste
            </Button>
          </Col>
        </Row>
        <Row>
          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-signature"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Nom d'objectif</p>
                      <Card.Title as="h4">{nom}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {pack}
                </div> */}
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-bullseye"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Objectif à atteindre CA</p>
                      <Card.Title as="h4">{objectif}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats block-invisible">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div> */}
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-bullseye"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Objectif restant CA</p>
                      <Card.Title as="h4">{(objectif - countBl)>=0?(objectif - countBl).toFixed(3):0}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats block-invisible">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div> */}
              </Card.Footer>
            </Card>
          </Col>

          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-gifts"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Pack</p>
                      <Card.Title as="h4">
                        <GroupPacks groupPacks={pack}></GroupPacks>
                      </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  {pack}
                </div> */}
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Date debut</p>
                      <Card.Title as="h4">{dateDebut}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats block-invisible">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div> */}
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="4" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Date fin</p>
                      <Card.Title as="h4">{dateFin}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                {/* <div className="stats block-invisible">
                  <i className="fas fa-redo mr-1"></i>
                  Update now
                </div> */}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          {testDate === true ? (
            parseInt(idRole) === 2 ? (
              <Col md="12">
                <h4 className="title">
                 Listes des pharmacies en cours d’une AC
                </h4>
                <Card>
                  <Card.Body>
                    <ReactTable
                      data={entities}
                      columns={[
                        {
                          Header: "Nom pharmacie",
                          accessor: "Pharmacie",
                        },
                        {
                          Header: "Segment",
                          accessor: "nomSeg",
                        },
                        {
                          Header: "CA",
                          accessor: "id_pharmacie",
                          Cell: ({ cell }) => (
                            <div>
                              {caPharmacie[cell.row.original.id_pharmacie]}
                            </div>
                          ),
                        },
                        {
                          Header: "Détail",
                          accessor: "",
                          Cell: ({ cell }) => (
                            <div>
                              <Button
                                id={"idLigneV_" + cell.row.values.id_pharmacie}
                                onClick={(e) => {
                                  localStorage.setItem(
                                    "returnVis",
                                    `/visualisation/${id}/${location.idLine}`
                                  );
                                  navigate(
                                    "/detailVisualisation/" +
                                      id +
                                      "/" +
                                      cell.row.values.id_pharmacie
                                  );
                                }}
                                className="btn btn-info"
                              >
                                Détail
                              </Button>
                            </div>
                          ),
                        },
                        {
                          Header: "BL",
                          accessor: "",
                          Cell: ({ cell }) => (
                            <div className="block-action">
                              <Button
                                className="message"
                                onClick={(e) => {
                                  localStorage.setItem(
                                    "returnVis",
                                    `/visualisation/${id}/${location.idLine}`
                                  );
                                  navigate(
                                    `/detailSuivi/${cell.row.original.id_pharmacie}/${id}`
                                  );
                                }}
                                variant="success"
                                size="sm"
                              >
                                Visualiser
                                <i
                                  className="fa fa-eye"
                                  id={"idLigne_" + cell.row.values.id}
                                />
                              </Button>
                            </div>
                          ),
                        },
                        {
                          Header: "Clôturer",
                          accessor: "id",
                          Cell: ({ cell }) => (
                            <div className="actions-check block-action">
                              <Row>
                                <Col md="4">
                                  <Form.Check className="form-check-radio">
                                    <Form.Check.Label>
                                      <Form.Check.Input
                                        onClick={(val) =>
                                          confirmMessage(
                                            val.target.value,
                                            cell.row.original
                                          )
                                        }
                                        defaultValue={idRole === 2 ? "1" : "3"}
                                        id="exampleRadios21"
                                        name="exampleRadio"
                                        type="radio"
                                      ></Form.Check.Input>
                                      <span className="form-check-sign"></span>
                                      Oui
                                    </Form.Check.Label>
                                  </Form.Check>
                                </Col>
                                <Col md="6">
                                  <Form.Check className="form-check-radio">
                                    <Form.Check.Label>
                                      <Form.Check.Input
                                        onClick={(val) =>
                                          confirmMessage(
                                            val.target.value,
                                            cell.row.original
                                          )
                                        }
                                        defaultValue={idRole === 2 ? "2" : "4"}
                                        id="exampleRadios21"
                                        name="exampleRadio"
                                        type="radio"
                                      ></Form.Check.Input>
                                      <span className="form-check-sign"></span>
                                      Non
                                    </Form.Check.Label>
                                  </Form.Check>
                                </Col>
                              </Row>
                            </div>
                          ),
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
              </Col>
            ) : (
              ""
            )
          ) : (
            ""
          )}
          <Col md="12">
            <h4 className="title">
              Liste des pharmacies en cours de validation
            </h4>
            <Card className="table-visualisation-action">
              <Card.Body>
                <ReactTable
                  data={entitiesEnCours}
                  columns={[
                    {
                      Header: "Délégue",
                      accessor: "delegue",
                    },
                    {
                      Header: "Nom pharmacie",
                      accessor: "Pharmacie",
                    },
                    {
                      Header: "Segment",
                      accessor: "nomSeg",
                    },
                    {
                      Header: "CA",
                      accessor: "total",
                    },
                    {
                      Header: "Détail",
                      accessor: "",
                      Cell: ({ cell }) => (
                        <div>
                          <Button
                            id={"idLigneV_" + cell.row.values.id_pharmacie}
                            onClick={(e) => {
                              localStorage.setItem(
                                "returnVis",
                                `/visualisation/${id}/${location.idLine}`
                              );
                              navigate("/detailValider/" +cell.row.values.id);
                            }}
                            className="btn btn-info"
                          >
                            Détail
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "BL",
                      accessor: "",
                      Cell: ({ cell }) => (
                        <div className="block-action">
                          <Button
                            className="message"
                            onClick={(e) => {
                              localStorage.setItem(
                                "returnVis",
                                `/visualisation/${id}/${location.idLine}`
                              );
                              navigate(
                                `/detailCmd/${cell.row.original.id}`
                              );
                            }}
                            variant="success"
                            size="sm"
                          >
                            Visualiser
                            <i
                              className="fa fa-eye"
                              id={"idLigne_" + cell.row.values.id}
                            />
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "Clôturer",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-check block-action">
                          {idRole === 1?
                            <Row>
                              <Col md="4">
                                <Form.Check className="form-check-radio">
                                  <Form.Check.Label>
                                    <Form.Check.Input
                                      onClick={(val) =>
                                        confirmMessage(
                                          val.target.value,
                                          cell.row.original
                                        )
                                      }
                                      defaultValue={idRole === 2 ? "1" : "3"}
                                      id="exampleRadios21"
                                      name="exampleRadio"
                                      type="radio"
                                    ></Form.Check.Input>
                                    <span className="form-check-sign"></span>
                                    Oui
                                  </Form.Check.Label>
                                </Form.Check>
                              </Col>
                              <Col md="6">
                                <Form.Check className="form-check-radio">
                                  <Form.Check.Label>
                                    <Form.Check.Input
                                      onClick={(val) =>
                                        confirmMessage(
                                          val.target.value,
                                          cell.row.original
                                        )
                                      }
                                      defaultValue={idRole === 2 ? "2" : "4"}
                                      id="exampleRadios21"
                                      name="exampleRadio"
                                      type="radio"
                                    ></Form.Check.Input>
                                    <span className="form-check-sign"></span>
                                    Non
                                  </Form.Check.Label>
                                </Form.Check>
                              </Col>
                            </Row>
                          :""}
                        </div>
                      ),
                    },
                    {
                      Header: "action",
                      accessor: "",
                    },
                  ]}
                />
                {entitiesEnCours.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md="12">
            <h4 className="title">Liste des pharmacies validées</h4>
            <Card className="table-visualisation-action">
              <Card.Body>
                <ReactTable
                  data={commande}
                  columns={[
                    {
                      Header: "Délégué",
                      accessor: "users.nom",
                      Cell: ({ cell }) => (
                        <div>
                          {cell.row.original.users.nomU +
                            " " +
                            cell.row.original.users.prenomU}
                        </div>
                      ),
                    },
                    {
                      Header: "Nom pharmacie",
                      accessor: "pharmacies.nom",
                    },
                    {
                      Header: "Segment",
                      accessor: "segments.nom",
                    },
                    {
                      Header: "Détail",
                      accessor: "",
                      Cell: ({ cell }) => (
                        <div>
                          <Button
                            id={"idLigneV_" + cell.row.original.pharmacies.id}
                            onClick={(e) => {
                              navigate("/detailValider/" +cell.row.values.id);
                              localStorage.setItem(
                                "returnVis",
                                `/visualisation/${id}/${location.idLine}`
                              );
                            }}
                            className="btn btn-info"
                          >
                            Détail
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "BL",
                      accessor: "",
                      Cell: ({ cell }) => (
                        <div className="block-action">
                          <Button
                            className="message"
                            onClick={(e) => {
                              localStorage.setItem(
                                "returnVis",
                                `/visualisation/${id}/${location.idLine}`
                              );
                              navigate(
                                `/detailCmd/${cell.row.original.id}`
                              );
                            }}
                            variant="success"
                            size="sm"
                          >
                            Visualiser
                            <i
                              className="fa fa-eye"
                              id={"idLigne_" + cell.row.values.id}
                            />
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "Note",
                      accessor: "note",
                      Cell: ({ cell }) => (
                        <div>
                          <Button
                            id={"idLigneV_" + cell.row.values.id}
                            onClick={(e) => {
                              getCommentaire(cell.row.values.note);
                            }}
                            className="btn btn-info"
                          >
                            Lire
                            <i
                              className="fa fa-comment"
                              id={"idLigneV_" + cell.row.values.id}
                            />
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "décharge",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <Button
                          id={"idLigne_" + cell.row.values.id}
                          onClick={(e) => {
                            navigate(
                              "/telechargerFichier/" +
                                cell.row.original.payer +
                                "/" +
                                cell.row.values.id
                            );
                            localStorage.setItem(
                              "file",
                              cell.row.original.decharge
                            );
                            localStorage.setItem(
                              "returnList",
                              "visualisation/" + id + "/" + idLine
                            );
                          }}
                          className="btn btn-info ml-1 visualiser"
                        >
                          <i
                            className="fa fa-money-check"
                            id={"idLigne_" + cell.row.values.id}
                          />
                        </Button>
                      ),
                    },
                    {
                      Header: "action",
                      accessor: "action",
                      Cell: ({ cell }) =>
                        idRole === 0 || idRole === 5 ? (
                          <Button
                            onClick={(e) => {
                              confirmMessage("5", cell.row.original);
                            }}
                            className="btn btn-danger ml-1 visualiser"
                          >
                            Annuler <i className="fa fa-trash" />
                          </Button>
                        ) : (
                          ""
                        ),
                    },
                    {
                      Header: "t",
                      accessor: "",
                    },
                  ]}
                />
                {commande.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
          {idRole === 1 || idRole === 2 ? (
            <Col md="12">
              <h4 className="title">Liste des pharmacies refusés</h4>
              <Card className="table-visualisation-action">
                <Card.Body>
                  <ReactTable
                    data={commandeR}
                    columns={[
                      {
                        Header: "Délégué",
                        accessor: "users.nom",
                        Cell: ({ cell }) => (
                          <div>
                            {cell.row.original.users.nomU +
                              " " +
                              cell.row.original.users.prenomU}
                          </div>
                        ),
                      },
                      {
                        Header: "Nom pharmacie",
                        accessor: "pharmacies.nom",
                      },
                      {
                        Header: "Détail",
                        accessor: "",
                        Cell: ({ cell }) => (
                          <div>
                            <Button
                              id={"idLigneV_" + cell.row.original.pharmacies.id}
                              onClick={(e) => {
                                navigate("/detailValider/" +cell.row.original.id);
                                localStorage.setItem(
                                  "returnVis",
                                  `/visualisation/${id}/${location.idLine}`
                                );
                              }}
                              className="btn btn-info"
                            >
                              Détail
                            </Button>
                          </div>
                        ),
                      },
                      {
                        Header: "BL",
                        accessor: "",
                        Cell: ({ cell }) => (
                          <div className="block-action">
                            <Button
                              className="message"
                              onClick={(e) => {
                                localStorage.setItem(
                                  "returnVis",
                                  `/visualisation/${id}/${location.idLine}`
                                );
                                navigate(
                                  `/detailCmd/${cell.row.original.id}`
                                );
                              }}
                              variant="success"
                              size="sm"
                            >
                              Visualiser
                              <i
                                className="fa fa-eye"
                                id={"idLigne_" + cell.row.values.id}
                              />
                            </Button>
                          </div>
                        ),
                      },
                      {
                        Header: "Note",
                        accessor: "note",
                        Cell: ({ cell }) => (
                          <div>
                            <Button
                              id={"idLigneV_" + cell.row.values.id}
                              onClick={(e) => {
                                getCommentaire(cell.row.values.note);
                              }}
                              className="btn btn-info"
                            >
                              Lire
                              <i
                                className="fa fa-comment"
                                id={"idLigneV_" + cell.row.values.id}
                              />
                            </Button>
                          </div>
                        ),
                      },
                      {
                        Header: "action",
                        accessor: "action",
                        Cell: ({ cell }) =>
                          idRole === 1 ? (
                            <div>
                              <Button
                                onClick={(e) => {
                                  confirmMessage("3", cell.row.original);
                                }}
                                className="btn btn-success ml-1 visualiser"
                              >
                                Valider <i className="fa fa-check" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  confirmMessage("6", cell.row.original);
                                }}
                                className="btn btn-danger ml-1 visualiser"
                              >
                                Annuler <i className="fa fa-trash" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Button
                                onClick={(e) => {
                                  confirmMessage("7", cell.row.original);
                                }}
                                className="btn btn-danger ml-1 visualiser"
                              >
                                Modifier <i className="fa fa-trash" />
                              </Button>
                            </div>
                          ),
                      },
                      {
                        Header: "t",
                        accessor: "",
                      },
                    ]}
                  />
                  {commandeR.length === 0 ? (
                    <div className="text-center">Aucun donnée trouvé</div>
                  ) : (
                    ""
                  )}
                </Card.Body>
              </Card>
            </Col>
          ) : (
            ""
          )}
        </Row>
      </Container>
    </>
  );
}

export default ListVisualisation;
