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

  saveMeasurements = () => {
    //Get displayed mesures
    for (let i = 0; i < this.props.freehandData.length; i++) {
      this.props.freehandData[i].displayed = false;
    }
    var mesures = this.props.freehandData;

    //Get file mesures that hadn't been loaded
    var loadedData = cornerstoneTools.globalImageIdSpecificToolStateManager.saveCustomToolState();
    Object.keys(loadedData).forEach(function(key) {
      var measurementTab = loadedData[key];
      for (let i = 0; i < measurementTab.length; i++) {
        if (measurementTab[i].displayed == false) {
          mesures.push(measurementTab[i]);
        }
      }
    });

    //Save in a txt file (JSON format)
    var jsonString = JSON.stringify(mesures);
    var FileSaver = require('file-saver');
    var blob = new Blob([jsonString], {
      type: 'text/plain;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'measurements.txt');
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

    reader.readAsText(this.refs.test1.files[0]);
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
        <button onClick={this.displayMeasurements}>Display measurements</button>
        <button onClick={this.saveMeasurements}>Save measurements</button>
        <button onClick={this.loadMeasurements}>Load measurements</button>
        <input type="file" id="files" name="files[]" ref="test1" multiple />
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
