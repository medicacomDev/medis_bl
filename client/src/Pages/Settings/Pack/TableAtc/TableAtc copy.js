import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap";
// react-bootstrap components
import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { getProduits } from "../../../../Redux/atcReduce.js";
import { useCallback } from "react";

function TableAtc({ entities, optionGame, setEntities, array, setArray }) {
  const location = useParams();
  const dispatch = useDispatch();
  var id = location.id;
  const [atcSelect, setAtcSelect] = React.useState([]);

  const getProduitMarcheBD = useCallback(
    async (list1, array) => {
      var listHtml = [...array];
      list1.forEach((val,key)=>{
        var findMarcheAtc = val.marches;
        var findProduitAtc = val.produits;
        //create html marche/produit
        var htmlArray = [];
        var objMarche = {};
        var arrayMarche = {};
        findMarcheAtc.forEach((element, key1) => {
          arrayMarche[element.id_marche] = key1;
          objMarche[element.id_marche] = element;
        });
        var objProduit = {};
        var arrayProduit = {};
        findProduitAtc.forEach((element, key1) => {
          arrayProduit[element.id_produit] = key1;
          if (!objProduit[element.id_marche]) {
            objProduit[element.id_marche] = [];
          }
          objProduit[element.id_marche].push(element);
        });
  
        for (const key1 in objMarche) {
          const element1 = objMarche[key1];
          const element2 = objProduit[key1];
          /* start push array marche */
          var tdArry = [];
          htmlArray.push(
            <tr className="success" key={"trm-head-" + key1}>
              <td>Marche</td>
              <td>
                <div className="div-hidden"></div>
              </td>
              <td>
                <div className="div-hidden"></div>
              </td>
            </tr>
          );
          tdArry.push(
            <td key={"trm" + key1 + "-d-" + element1.id_marche}>
              {element1.marches.lib}
            </td>
          );
          tdArry.push(
            <td key={"trm" + key1 + "-qte-" + element1.id_marche}>
              <Form.Group>
                <Form.Control
                  defaultValue={element1.quantite}
                  placeholder="Quantité"
                  type="text"
                  onChange={(value) => {
                    var listFinal = [...list1];
                    var indexP = arrayMarche[key1];
                    var obj = listFinal[key].marches[indexP];                    
                    obj = {...obj,qte:(value.target.value)}
                    //obj.qte = value.target.value;
                    setEntities(listFinal);
                  }}
                ></Form.Control>
              </Form.Group>
            </td>
          );
          tdArry.push(
            <td key={"trm" + key1 + "-mnt-" + element1.id_marche}>
              <Form.Group>
                <Form.Control
                  defaultValue={element1.montant}
                  placeholder="Montant"
                  type="text"
                  onChange={(value) => {
                    var listFinal = [...list1];
                    var indexP = arrayMarche[key1];
                    var obj = listFinal[key].marches[indexP];
                    obj = {...obj,mnt:(value.target.value)}
                    //obj.mnt = value.target.value;
                    setEntities(listFinal);
                  }}
                ></Form.Control>
              </Form.Group>
            </td>
          );
          htmlArray.push(
            <tr key={"trm-" + key1 + " " + element1.id_marche}>{tdArry}</tr>
          );
          /* end push array marche */
  
          /* start push array produit */
          htmlArray.push(
            <tr className="info" key={"trp-head-" + key1}>
              <td>Produit</td>
              <td>
                <div className="div-hidden"></div>
              </td>
              <td>
                <div className="div-hidden"></div>
              </td>
            </tr>
          );
  
          for (let index = 0; index < element2.length; index++) {
            const element3 = element2[index];
            var tdArry1 = [];
            tdArry1.push(
              <td key={"tr" + key1 + "-d-" + element3.id_produit}>
                {element3.produits.designation}
              </td>
            );
            tdArry1.push(
              <td key={"tr" + key1 + "-qte-" + element3.id_produit}>
                <Form.Group>
                  <Form.Control
                    defaultValue={element3.quantite}
                    placeholder="Quantité"
                    type="text"
                    onChange={(value) => {
                      var indexP = arrayProduit[element3.id_produit];
                      var listFinal = [...list1];
                      var obj = listFinal[key].produits[indexP];
                      obj = {...obj,qte:(value.target.value)}
                      //obj.qte = value.target.value;
                      setEntities(listFinal);
                    }}
                  ></Form.Control>
                </Form.Group>
              </td>
            );
            tdArry1.push(
              <td key={"tr" + key1 + "-mnt-" + element3.id_produit}>
                <Form.Group>
                  <Form.Control
                    defaultValue={element3.montant}
                    placeholder="Montant"
                    type="text"
                    onChange={(value) => {
                      var indexP = arrayProduit[element3.id_produit];
                      var listFinal = [...list1];
                      var obj = listFinal[key].produits[indexP];
                      obj = {...obj,mnt:(value.target.value)}
                      //obj.mnt = value.target.value;
                      setEntities(listFinal);
                    }}
                  ></Form.Control>
                </Form.Group>
              </td>
            );
            htmlArray.push(
              <tr key={"trp-" + index + " " + element3.id_produit}>{tdArry1}</tr>
            );
          }
          /* end push array produit */
        }
        listHtml[key] = htmlArray;

      }) 
      setArray(listHtml);
    },
    [dispatch]
  );
  useEffect(() => {
    if(isNaN(id) === false)
    getProduitMarcheBD(entities, array)
    /* if (entities.length > 0) {
      entities.forEach((val,key)=>{
        getProduitMarcheBD(entities, array,key,val.marches,val.produits)
      })
    } */
  }, [optionGame, entities]);

  const getProduitMarche = useCallback(
    async (list1, array, atc, id, key) => {
      var req = await dispatch(getProduits(id));
      var res = req.payload;
      var findMarcheAtc = res.findMarcheAtc;
      var findProduitAtc = res.findProduitAtc;
      atc.marches = findMarcheAtc;
      atc.produits = findProduitAtc;
      list1[key] = atc;
      setEntities(list1);

      //create html marche/produit
      var htmlArray = [];
      var objMarche = {};
      var arrayMarche = {};
      findMarcheAtc.forEach((element, key1) => {
        arrayMarche[element.id_marche] = key1;
        objMarche[element.id_marche] = element;
      });
      var objProduit = {};
      var arrayProduit = {};
      findProduitAtc.forEach((element, key1) => {
        arrayProduit[element.id_produit] = key1;
        if (!objProduit[element.id_marche]) {
          objProduit[element.id_marche] = [];
        }
        objProduit[element.id_marche].push(element);
      });
      for (const key1 in objMarche) {
        const element1 = objMarche[key1];
        const element2 = objProduit[key1];
        /* start push array marche */
        var tdArry = [];
        htmlArray.push(
          <tr className="success" key={"trm-head-" + key1}>
            <td>Marche</td>
            <td>
              <div className="div-hidden"></div>
            </td>
            <td>
              <div className="div-hidden"></div>
            </td>
          </tr>
        );
        tdArry.push(
          <td key={"trm" + key1 + "-d-" + element1.id_marche}>
            {element1.lib}
          </td>
        );
        tdArry.push(
          <td key={"trm" + key1 + "-qte-" + element1.id_marche}>
            <Form.Group>
              <Form.Control
                defaultValue={0}
                placeholder="Quantité"
                type="text"
                onChange={(value) => {
                  var listFinal = [...entities];
                  console.log(listFinal)
                  /* var indexP = arrayMarche[key1];
                  var obj = listFinal[key].marches[indexP];
                  obj = {...obj,qte:(value.target.value)}
                  //obj.qte = value.target.value;
                  setEntities(listFinal); */
                }}
              ></Form.Control>
            </Form.Group>
          </td>
        );
        tdArry.push(
          <td key={"trm" + key1 + "-mnt-" + element1.id_marche}>
            <Form.Group>
              <Form.Control
                defaultValue={0}
                placeholder="Montant"
                type="text"
                onChange={(value) => {
                  var listFinal = [...list1];
                  var indexP = arrayMarche[key1];
                  var obj = listFinal[key].marches[indexP];
                  obj = {...obj,mnt:(value.target.value)}
                  //obj.mnt = value.target.value;
                  setEntities(listFinal);
                }}
              ></Form.Control>
            </Form.Group>
          </td>
        );
        htmlArray.push(
          <tr key={"trm-" + key1 + " " + element1.id_marche}>{tdArry}</tr>
        );
        /* end push array marche */

        /* start push array produit */
        htmlArray.push(
          <tr className="info" key={"trp-head-" + key1}>
            <td>Produit</td>
            <td>
              <div className="div-hidden"></div>
            </td>
            <td>
              <div className="div-hidden"></div>
            </td>
          </tr>
        );

        for (let index = 0; index < element2.length; index++) {
          const element3 = element2[index];
          var tdArry1 = [];
          tdArry1.push(
            <td key={"tr" + key1 + "-d-" + element3.id_produit}>
              {element3.designation}
            </td>
          );
          tdArry1.push(
            <td key={"tr" + key1 + "-qte-" + element3.id_produit}>
              <Form.Group>
                <Form.Control
                  defaultValue={0}
                  placeholder="Quantité"
                  type="text"
                  onChange={(value) => {
                    var indexP = arrayProduit[element3.id_produit];
                    var listFinal = [...list1];
                    var obj = listFinal[key].produits[indexP];
                    obj = {...obj,qte:(value.target.value)}
                    //obj.qte = value.target.value;
                    setEntities(listFinal);
                  }}
                ></Form.Control>
              </Form.Group>
            </td>
          );
          tdArry1.push(
            <td key={"tr" + key1 + "-mnt-" + element3.id_produit}>
              <Form.Group>
                <Form.Control
                  defaultValue={0}
                  placeholder="Montant"
                  type="text"
                  onChange={(value) => {
                    var indexP = arrayProduit[element3.id_produit];
                    var listFinal = [...list1];
                    var obj = listFinal[key].produits[indexP];
                    obj = {...obj,mnt:(value.target.value)}
                    //obj.mnt = value.target.value;
                    setEntities(listFinal);
                  }}
                ></Form.Control>
              </Form.Group>
            </td>
          );
          htmlArray.push(
            <tr key={"trp-" + index + " " + element3.id_produit}>{tdArry1}</tr>
          );
        }
        /* end push array produit */
      }

      var listHtml = [...array];
      listHtml[key] = htmlArray;
      setArray(listHtml);
    },
    [dispatch]
  );
  return (
    <>
      <div>
        {entities.map((val, key) => {
          return (
            <div key={"atc-" + key}>
              <h3>Atc</h3>
              <Row>
                <Col md="4">
                  {val.id === null ? (
                    <Select
                      placeholder="atc"
                      className="react-select primary"
                      classNamePrefix="react-select"
                      value={atcSelect[key]}
                      onChange={(val1) => {
                        var list = [...atcSelect];
                        list[key] = val1;
                        setAtcSelect(list);
                        var list1 = [...entities];
                        var atc = list1[key];
                        atc.id_atc = val1.value;
                        getProduitMarche(list1, array, atc, val1.value, key);
                      }}
                      options={optionGame}
                    />
                  ) : (
                    <Form.Group>
                      <Form.Control
                        readOnly
                        defaultValue={val.atcs.nom}
                        placeholder="atc"
                        type="text"
                        /* onChange={(val1) => {
                          var list = [...entities];
                          var atc = list[key];
                          atc.quantite = val1.target.value;
                          list[key] = atc;
                        }} */
                      ></Form.Control>
                    </Form.Group>)}
                </Col>
                <Col md="4">
                  <Form.Group>
                    <Form.Control
                      defaultValue={val.quantite}
                      placeholder="Qte"
                      type="number"
                      onChange={(val1) => {
                        var list = [...entities];
                        var atc = list[key];
                        atc = {...atc,quantite:(val1.target.value)}
                        list[key] = atc;
                        setEntities(list)
                        /* atc.quantite = val1.target.value;
                        list[key] = atc; */
                      }}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col md="4">
                  <Form.Group>
                    <Form.Control
                      defaultValue={val.montant}
                      placeholder="mnt"
                      type="number"
                      onChange={(val1) => {
                        var list = [...entities];
                        var atc = list[key];
                        /* atc.montant = val1.target.value;
                        list[key] = atc; */
                        atc = {...atc,montant:(val1.target.value)}
                        list[key] = atc;
                        setEntities(list)
                      }}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col col="12">
                  <table className="table-hover table-striped w-full table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Qte</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>{array[key]}</tbody>
                  </table>

                  {/* {array[key].marches.map((mar,key1)=>{
                    return (mar.lib+" ")
                  })} */}
                </Col>
              </Row>
              <hr></hr>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default TableAtc;
