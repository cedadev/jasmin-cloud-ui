/**
 * This module contains components for the tenancy machines page.
 */

import React from 'react';

import get from 'lodash/get';

import { ResourcePanel } from './resource-utils';
import { ClustersTable } from './clusters-table';
import { CreateClusterButton } from './create-cluster-modal';
import { Loading } from '../../utils';

const Clusters = ({ resourceData, resourceActions, ...props }) => (
    <ClustersTable
        clusters={resourceData}
        clusterActions={resourceActions}
        {...props}
    />
);

export class TenancyClustersPanel extends React.Component {
    setPageTitle() {
        document.title = `Clusters | ${this.props.tenancy.name} | JASMIN Cloud Portal`;
    }

    componentDidMount = () => this.setPageTitle()

    componentDidUpdate = () => this.setPageTitle()

    render() {
        const { tenancy, tenancyActions } = this.props;
        const enabled = get(tenancy.clusters, 'enabled', false);
        const fetching = get(tenancy.clusters, 'fetching', false);
        if (enabled) {
            return (
                <ResourcePanel
                    resource={tenancy.clusters}
                    resourceActions={tenancyActions.cluster}
                    resourceName="clusters"
                    createButtonComponent={CreateClusterButton}
                    createButtonExtraProps={({ tenancy, tenancyActions })}
                >
                    <Clusters tenancy={tenancy} tenancyActions={tenancyActions} />
                </ResourcePanel>
            );
        }
        if (fetching) {
            return <Loading message="Loading clusters..." />;
        }

        return (
            <div
                role="alert"
                className="notification notification-inline notification-danger"
            >
                <div className="notification-content">
                    Clusters are not enabled for this tenancy
                </div>
            </div>
        );
    }
}
