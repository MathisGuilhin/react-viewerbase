import './MeasurementTable.styl';

import React, { Component } from 'react';
import { withTranslation } from '../../utils/LanguageProvider';

import { Icon } from './../../elements/Icon';
import { MeasurementTableItem } from './MeasurementTableItem.js';
import { OverlayTrigger } from './../overlayTrigger';
import PropTypes from 'prop-types';
import { ScrollableArea } from './../../ScrollableArea/ScrollableArea.js';
import { TableList } from './../tableList';
import { Tooltip } from './../tooltip';

import conerstoneTools from 'cornerstone-tools';

class MeasurementTable extends Component {
  static propTypes = {
    freehandData: PropTypes.array,
    measurementCollection: PropTypes.array.isRequired,
    timepoints: PropTypes.array.isRequired,
    overallWarnings: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    onItemClick: PropTypes.func,
    onRelabelClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onEditDescriptionClick: PropTypes.func,
    selectedMeasurementNumber: PropTypes.number,
    overwallWarnings: PropTypes.object,
    t: PropTypes.func,
  };

  static defaultProps = {
    overallWarnings: {
      warningList: [],
    },
    readOnly: false,
  };

  state = {
    selectedKey: null,
  };

  displayMeasurements = () => {
    console.log('Freehand Data : ', this.props.freehandData);
  };

  saveMetadata = () => {
    var patientId;

    var freehandMetadata = this.props.freehandData;

    //Create the metadata to be saved
    var metadata = [];
    var size = 5000 * freehandMetadata.length;
    for (let i = 0; i < size; i++) {
      metadata[i] = [];
    }

    //Write study metadata
    if (freehandMetadata[0]) {
      var studyMetadata = freehandMetadata[0].metadata.study;
      var patientMetadata = freehandMetadata[0].metadata.patient;
      patientId = patientMetadata.id;
      metadata[0][0] = 'Patient metadata';
      metadata[2][0] = '0010,0010';
      metadata[2][1] = patientMetadata.name;
      metadata[3][0] = '0010,0020';
      metadata[3][1] = patientMetadata.id;
      metadata[4][0] = '0010,0030';
      metadata[4][1] = patientMetadata.birthDate;
      metadata[5][0] = '0010,0040';
      metadata[5][1] = patientMetadata.sex;
      metadata[6][0] = '0010,1010';
      metadata[6][1] = patientMetadata.age;
      metadata[8][0] = 'Study metadata';
      metadata[10][0] = '0008,0020';
      metadata[10][1] = studyMetadata.studyDate;
      metadata[11][0] = '0008,0030';
      metadata[11][1] = studyMetadata.studyTime;
      metadata[12][0] = '0008,0050';
      metadata[12][1] = studyMetadata.accessionNumber;
      metadata[13][0] = '0008,0080';
      metadata[13][1] = studyMetadata.institutionName;
      metadata[14][0] = '0008,1030';
      metadata[14][1] = studyMetadata.studyDescription;
      metadata[15][0] = '0010,0020';
      metadata[15][1] = studyMetadata.patientId;
      metadata[16][0] = '0010,21B0';
      metadata[16][1] = studyMetadata.patientHistory;
      metadata[17][0] = '0020,000D';
      metadata[17][1] = studyMetadata.studyInstanceUid;
    }

    var seriesInstanceUids = [];
    //Sorting measurement by seriesInstanceUID
    freehandMetadata.forEach(function(measurement) {
      if (!seriesInstanceUids[measurement.metadata.series.seriesInstanceUid]) {
        seriesInstanceUids[measurement.metadata.series.seriesInstanceUid] = [];
      }
      seriesInstanceUids[measurement.metadata.series.seriesInstanceUid].push(
        measurement
      );
    });

    //Loop on keys (series)
    let indexTxtFile = 19;
    let indexSerie = 0;
    Object.keys(seriesInstanceUids).forEach(function(key) {
      indexSerie += 1;
      var measurementTab = seriesInstanceUids[key];
      var seriesMetadata = measurementTab[0].metadata.series;
      //Write series metadata
      metadata[indexTxtFile][0] = 'Serie ' + indexSerie + ' Metadata';
      metadata[indexTxtFile + 2][0] = '0008,0021';
      metadata[indexTxtFile + 2][1] = seriesMetadata.seriesDate;
      metadata[indexTxtFile + 3][0] = '0008,0031';
      metadata[indexTxtFile + 3][1] = seriesMetadata.seriesTime;
      metadata[indexTxtFile + 4][0] = '0008,103E';
      metadata[indexTxtFile + 4][1] = seriesMetadata.seriesDescription;
      metadata[indexTxtFile + 5][0] = '0008,0060';
      metadata[indexTxtFile + 5][1] = seriesMetadata.modality;
      metadata[indexTxtFile + 6][0] = '0020,000E';
      metadata[indexTxtFile + 6][1] = seriesMetadata.seriesInstanceUid;
      metadata[indexTxtFile + 7][0] = '0020,0011';
      metadata[indexTxtFile + 7][1] = seriesMetadata.seriesNumber;
      metadata[indexTxtFile + 8][0] = '0020,1003';
      metadata[indexTxtFile + 8][1] = seriesMetadata.numImages;
      indexTxtFile += 10;
      for (let i = 0; i < measurementTab.length; i++) {
        var instanceMetadata = measurementTab[i].metadata.instance;
        metadata[indexTxtFile][0] =
          'Serie ' + indexSerie + ' instance ' + (i + 1) + ' metadata';
        //Write instance metadata
        metadata[indexTxtFile + 2][0] = '0020,0011';
        metadata[indexTxtFile + 2][1] = instanceMetadata.seriesNumber;
        metadata[indexTxtFile + 3][0] = '0020,0012';
        metadata[indexTxtFile + 3][1] = instanceMetadata.acquisitionNumber;
        metadata[indexTxtFile + 4][0] = '0020,0013';
        metadata[indexTxtFile + 4][1] = instanceMetadata.imageNumber;
        metadata[indexTxtFile + 5][0] = '0020,0032';
        metadata[indexTxtFile + 5][1] = instanceMetadata.imagePositionPatient;
        metadata[indexTxtFile + 6][0] = '0020,0037';
        metadata[indexTxtFile + 6][1] =
          instanceMetadata.imageOrientationPatient;
        metadata[indexTxtFile + 7][0] = '0020,0052';
        metadata[indexTxtFile + 7][1] = instanceMetadata.frameOfReferenceUID;
        metadata[indexTxtFile + 8][0] = '0020,0060';
        metadata[indexTxtFile + 8][1] = instanceMetadata.laterality;
        metadata[indexTxtFile + 9][0] = '0020,1002';
        metadata[indexTxtFile + 9][1] = instanceMetadata.imagesInAcquisition;
        metadata[indexTxtFile + 10][0] = '0020,1041';
        metadata[indexTxtFile + 10][1] = instanceMetadata.sliceLocation;
        metadata[indexTxtFile + 12][0] = 'Segmentation coordinates';
        indexTxtFile += 14;
        measurementTab[i].handles.points.forEach(function(FreehandHandleData) {
          metadata[indexTxtFile][0] = FreehandHandleData.x;
          metadata[indexTxtFile][1] = FreehandHandleData.y;
          indexTxtFile++;
        });
        indexTxtFile++;
      }
    });

    //Delete unused instanced tab row
    metadata.length -= size - indexTxtFile;

    //Convert tab into csv content
    let csvContent = metadata.map(e => e.join(',')).join('\n');

    //Save in a txt file (csv format)
    var FileSaver = require('file-saver');
    var blob = new Blob([csvContent], {
      type: 'text/plain;charset=utf-8',
    });
    FileSaver.saveAs(blob, patientId + 'metadata');
  };

  saveMeasurements = () => {
    var patientId;
    //Get displayed mesures
    for (let i = 0; i < this.props.freehandData.length; i++) {
      this.props.freehandData[i].displayed = false;
      if (!patientId) {
        patientId = this.props.freehandData[i].patientId;
      }
    }
    var mesures = this.props.freehandData;

    //Get file mesures that hadn't been loaded
    var loadedData = cornerstoneTools.globalImageIdSpecificToolStateManager.saveCustomToolState();
    Object.keys(loadedData).forEach(function(key) {
      var measurementTab = loadedData[key];
      for (let i = 0; i < measurementTab.length; i++) {
        if (measurementTab[i].displayed == false) {
          mesures.push(measurementTab[i]);
          if (!patientId) {
            patientId = measurementTab[i].patientId;
          }
        }
      }
    });

    //Save in a txt file (JSON format)
    var jsonString = JSON.stringify(mesures);
    var FileSaver = require('file-saver');
    var blob = new Blob([jsonString], {
      type: 'text/plain;charset=utf-8',
    });
    FileSaver.saveAs(blob, patientId);
  };

  loadMeasurements = () => {
    var reader = new FileReader();
    var fileText = '';

    reader.onload = function(event) {
      fileText = reader.result;
      var measurementsLoaded = JSON.parse(fileText);

      //Get the ID of the current displayed image
      var enabledElement = cornerstoneTools.external.cornerstone.getEnabledElements()[0];
      var enabledImageId = enabledElement.image.imageId;

      var toolState = [];

      for (let i = 0; i < measurementsLoaded.length; i++) {
        var imageId =
          'wadors:https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/' +
          measurementsLoaded[i].studyInstanceUid +
          '/series/' +
          measurementsLoaded[i].seriesInstanceUid +
          '/instances/' +
          measurementsLoaded[i].sopInstanceUid +
          '/frames/1';
        if (imageId == enabledImageId) {
          //Display the segmentation of the current displayed image
          measurementsLoaded[i].displayed = true;
          cornerstoneTools.addToolState(
            enabledElement.element,
            'FreehandMouse',
            measurementsLoaded[i]
          );
        }
        //Set tool states in the state manager for future drawing in FreehandMouseTool
        if (!toolState[imageId]) {
          toolState[imageId] = [];
          toolState[imageId][0] = measurementsLoaded[i];
        } else {
          toolState[imageId].push(measurementsLoaded[i]);
        }
      }
      cornerstoneTools.globalImageIdSpecificToolStateManager.restoreCustomToolState(
        toolState
      );
    };
    if (this.refs.test1.files[0]) {
      reader.readAsText(this.refs.test1.files[0]);
    } else {
      console.log('Aucun fichier de mesure renseigné');
    }
  };

  render() {
    const hasOverallWarnings =
      this.props.overallWarnings.warningList.length > 0;
    return (
      <div className="measurementTable">
        <div className="measurementTableHeader">
          {hasOverallWarnings && (
            <OverlayTrigger
              key={'overwall-warning'}
              placement="left"
              overlay={
                <Tooltip
                  placement="left"
                  className="in tooltip-warning"
                  id="tooltip-left"
                  style={{}}
                >
                  <div className="warningTitle">
                    {this.props.t('Criteria nonconformities')}
                  </div>
                  <div className="warningContent">
                    {this.getWarningContent()}
                  </div>
                </Tooltip>
              }
            >
              <span className="warning-status">
                <span className="warning-border">
                  <Icon name="exclamation-triangle" />
                </span>
              </span>
            </OverlayTrigger>
          )}
          {this.getTimepointsHeader()}
        </div>
        <ScrollableArea>
          <div>{this.getMeasurementsGroups()}</div>
        </ScrollableArea>
        <button onClick={this.displayMeasurements} className="button">
          Display measurements
        </button>
        <button onClick={this.saveMetadata} className="button">
          Save metadata
        </button>
        <button onClick={this.saveMeasurements} className="button">
          Save measurements
        </button>
        <button onClick={this.loadMeasurements} className="button">
          Load measurements
        </button>
        <input
          type="file"
          id="files"
          name="files[]"
          ref="test1"
          multiple
          className="button"
        />
      </div>
    );
  }

  getMeasurementsGroups = () => {
    return this.props.measurementCollection.map((measureGroup, index) => {
      return (
        <TableList
          key={index}
          customHeader={this.getCustomHeader(measureGroup)}
        >
          {this.getMeasurements(measureGroup)}
        </TableList>
      );
    });
  };

  getMeasurements = measureGroup => {
    const selectedKey = this.props.selectedMeasurementNumber
      ? this.props.selectedMeasurementNumber
      : this.state.selectedKey;
    return measureGroup.measurements.map((measurement, index) => {
      const key = measurement.measurementNumber;
      const itemIndex = measurement.itemNumber || index + 1;
      const itemClass =
        selectedKey === key && !this.props.readOnly ? 'selected' : '';

      return (
        <MeasurementTableItem
          key={key}
          itemIndex={itemIndex}
          itemClass={itemClass}
          measurementData={measurement}
          onItemClick={this.onItemClick}
          onRelabel={this.props.onRelabelClick}
          onDelete={this.props.onDeleteClick}
          onEditDescription={this.props.onEditDescriptionClick}
        />
      );
    });
  };

  onItemClick = (event, measurementData) => {
    if (this.props.readOnly) return;

    this.setState({
      selectedKey: measurementData.measurementNumber,
    });

    if (this.props.onItemClick) {
      this.props.onItemClick(event, measurementData);
    }
  };

  getCustomHeader = measureGroup => {
    return (
      <React.Fragment>
        <div className="tableListHeaderTitle">
          {this.props.t(measureGroup.groupName)}
        </div>
        {measureGroup.maxMeasurements && (
          <div className="maxMeasurements">
            {this.props.t('MAX')} {measureGroup.maxMeasurements}
          </div>
        )}
        <div className="numberOfItems">{measureGroup.measurements.length}</div>
      </React.Fragment>
    );
  };

  getTimepointsHeader = () => {
    return this.props.timepoints.map((timepoint, index) => {
      return (
        <div key={index} className="measurementTableHeaderItem">
          <div className="timepointLabel">{timepoint.label}</div>
          <div className="timepointDate">{timepoint.date}</div>
        </div>
      );
    });
  };

  getWarningContent = () => {
    const { warningList = '' } = this.props.overwallWarnings;

    if (Array.isArray(warningList)) {
      const listedWarnings = warningList.map((warn, index) => {
        return <li key={index}>{warn}</li>;
      });

      return <ol>{listedWarnings}</ol>;
    } else {
      return <React.Fragment>{warningList}</React.Fragment>;
    }
  };
}

const connectedComponent = withTranslation('MeasurementTable')(
  MeasurementTable
);
export { connectedComponent as MeasurementTable };
export default connectedComponent;
