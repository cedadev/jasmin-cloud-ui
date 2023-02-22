/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';

import { ResourcePanel } from './resource-utils';
import { CreateMachineButton } from './create-machine-modal';
import { MachinesTable } from './machines-table';

const Machines = (props) => (
    <MachinesTable
        machines={props.resourceData}
        images={props.images}
        sizes={props.sizes}
        externalIps={props.externalIps}
        machineActions={props.resourceActions}
        externalIpActions={props.externalIpActions}
    />
);

export class TenancyMachinesPanel extends React.Component {
    setPageTitle() {
        document.title = `Machines | ${this.props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle()

    componentDidUpdate = () => this.setPageTitle()

    render() {
        const {
            tenancy: {
                machines, images, sizes, externalIps
            },
            tenancyActions
        } = this.props;
        return (
            <ResourcePanel
                resource={machines}
                resourceActions={tenancyActions.machine}
                resourceName="machines"
                createButtonComponent={CreateMachineButton}
                createButtonExtraProps={({ images, sizes })}
            >
                <Machines
                    images={images}
                    sizes={sizes}
                    externalIps={externalIps}
                    externalIpActions={tenancyActions.externalIp}
                />
            </ResourcePanel>
        );
    }
}
