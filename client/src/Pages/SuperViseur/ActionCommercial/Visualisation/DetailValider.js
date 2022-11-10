import React, { useCallback, useEffect } from "react";
import { getDetailCommande } from "../../../../Redux/blReduce";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Card, Container, Row, Col, Button } from "react-bootstrap";

// core components
function DetailValider() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useParams();
  var id = location.idCmd;
  const [entitiesAtc, setEntitiesAtc] = React.useState([]);
  const [entitiesProduit, setEntitiesProduit] = React.useState([]);
  const [entitiesMarche, setEntitiesMarche] = React.useState([]);
  const getDetails = useCallback(
    async () => {
      var detail = await dispatch(
        getDetailCommande(id)
      );
      var res = await detail.payload.qte;
      var res_p = await detail.payload.qte_p;
      var res_m = await detail.payload.qte_m;
      setEntitiesAtc(res);
      setEntitiesProduit(res_p);
      setEntitiesMarche(res_m);
    },
    [dispatch, id]
  );

  useEffect(() => {
    getDetails();
  }, [getDetails]); //now shut up eslint
  return (
    <>
      <Container>
        <Row>
          <Col md="12">
            <Button
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={() => {
                var nav = localStorage.getItem("returnVis");
                navigate(nav);
              }}
            >
              <span className="btn-label">
                <i className="fas fa-list"></i>
              </span>
              Retour à la liste
            </Button>
          </Col>
        </Row>
        <Card className="detail-vis">
          <Card.Body>
            <h2>Liste des gammes</h2>
            <table className="table-hover table table-vis">
              <thead>
                <tr className="info">
                  <th>Pack</th>
                  <th>Gamme</th>
                  <th>Quantite</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {entitiesAtc.map((e, k) => {
                  return (
                    <tr key={"pack-" + k}>
                      <td>{e.packs.nom}</td>
                      <td>{e.atcs ? e.atcs.nom : ""}</td>
                      <td>
                        {e.quantite} / {e.quantite_rest}
                      </td>
                      <td>
                        {e.montant.toFixed(2)} / {e.montant_rest}
                      </td>
                    </tr>
                  );
                })}
                {entitiesAtc.length === 0 ? (
                  <tr key={"pack-03"}>
                    <td className="center" colSpan={4}>
                      Aucun détail
                    </td>
                  </tr>
                ) : (
                  <tr key={"pack-02"}>
                    <td className="center" colSpan={4}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card.Body>
        </Card>
        <Card className="detail-vis">
          <Card.Body>
            <h2>Liste des produits</h2>
            <table className="table-hover table table-vis">
              <thead>
                <tr className="info">
                  <th>Produit</th>
                  <th>Pack</th>
                  <th>Gamme</th>
                  <th>Quantite</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {entitiesMarche.map((e, k) => {
                  return (
                    <tr key={"pack-" + k}>
                      <td>
                        {e.produits.marcheims ? e.produits.marcheims.lib : ""}
                      </td>
                      <td>{e.packs.nom}</td>
                      <td>{e.atcs ? e.atcs.nom : ""}</td>
                      <td>
                        {e.quantite} / {e.quantite_rest_m}
                      </td>
                      <td>
                        {e.montant.toFixed(2)} / {e.montant_rest_m}
                      </td>
                    </tr>
                  );
                })}
                {entitiesMarche.length === 0 ? (
                  <tr key={"pack-01"}>
                    <td className="center" colSpan={5}>
                      Aucun détail
                    </td>
                  </tr>
                ) : (
                  <tr key={"pack-02"}>
                    <td className="center" colSpan={5}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card.Body>
        </Card>
        <Card className="detail-vis">
          <Card.Body>
            <h2>Liste des présentations</h2>
            <table className="table-hover table table-vis">
              <thead>
                <tr className="info">
                  <th>Présentation</th>
                  <th>Produit</th>
                  <th>Pack</th>
                  <th>Gamme</th>
                  <th>Quantite</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {entitiesProduit.map((e, k) => {
                  return (
                    <tr key={"pack-" + k}>
                      <td>{e.produits ? e.produits.designation : ""}</td>
                      <td>
                        {e.produits.marcheims ? e.produits.marcheims.lib : ""}
                      </td>
                      <td>{e.packs.nom}</td>
                      <td>{e.atcs ? e.atcs.nom : ""}</td>
                      <td>
                        {e.quantite} / {e.quantite_rest_p}
                      </td>
                      <td>
                        {e.montant.toFixed(2)} / {e.montant_rest_p}
                      </td>
                    </tr>
                  );
                })}
                {entitiesProduit.length === 0 ? (
                  <tr key={"pack-02"}>
                    <td className="center" colSpan={6}>
                      Aucun détail
                    </td>
                  </tr>
                ) : (
                  <tr key={"pack-02"}>
                    <td className="center" colSpan={6}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default DetailValider;
