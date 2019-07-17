/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';

import { ResourcePanel } from './resource-utils';
import { CreateVolumeButton } from './create-volume-modal';
import { VolumesTable } from './volumes-table';


const Volumes = (props) => (
    <VolumesTable
      volumes={props.resourceData}
      machines={props.machines}
      volumeActions={props.resourceActions} />
);


export class TenancyVolumesPanel extends React.Component {
    setPageTitle(props) {
        document.title = `Volumes | ${this.props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle()
    componentDidUpdate = () => this.setPageTitle()

    render() {
        return (
            <ResourcePanel
              resource={this.props.tenancy.volumes}
              resourceActions={this.props.tenancyActions.volume}
              resourceName="volumes"
              createButtonComponent={CreateVolumeButton}>
                <Volumes machines={this.props.tenancy.machines} />
            </ResourcePanel>
        );
    }
}
