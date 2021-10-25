/**
 * Module containing a generic resource panel.
 */

import React from 'react';

import {
    Row, Col, ButtonGroup, Button, Form, InputGroup
} from 'react-bootstrap';

import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import startsWith from 'lodash/startsWith';

import { Loading, RichSelect } from '../../utils';

export const ResourcePanel = (props) => {
    const {
        resource: { fetching, data, creating },
        resourceActions,
        resourceName,
        children,
        createButtonComponent: CreateButtonComponent,
        createButtonExtraProps = {},
        className
    } = props;
    return (
        data ? (
            <>
                <Row className="justify-content-end">
                    <div className="py-2 d-block">
                        <ButtonGroup className="float-end">
                            {CreateButtonComponent && (
                                <CreateButtonComponent
                                    creating={creating}
                                    create={resourceActions.create}
                                    {...createButtonExtraProps}
                                />
                            )}
                            <Button
                                variant="info"
                                disabled={fetching}
                                onClick={resourceActions.fetchList}
                                title={`Refresh ${resourceName}`}
                            >
                                <i className={`fas fa-sync ${fetching ? 'fa-spin' : ''}`} />
                                {'\u00A0'}
                                Refresh
                            </Button>
                        </ButtonGroup>
                    </div>
                </Row>
                <Row>
                    {React.Children.map(
                        children,
                        (c) => React.cloneElement(c, { resourceData: data, resourceActions })
                    )}
                </Row>
            </>
        ) : (
            <Row>
                <Col md={6}>
                    {fetching ? (
                        <Loading message={`Loading ${resourceName}...`} />
                    ) : (
                        <div
                            role="notification"
                            className="notification notification-inline notification-danger"
                        >
                            <div className="notification-content">
                                Unable to load
                                {resourceName}
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        )
    );
};

const ResourceSelectControl = (props) => {
    const {
        resource: { fetching, data },
        resourceActions: _,
        resourceName,
        resourceNamePlural = `${resourceName}s`,
        resourceToOption = (r) => (<option key={r.id} value={r.id}>{r.name}</option>),
        sortResources = (rs) => sortBy(rs, ['name']),
        resourceFilter = (_) => true,
        ...rest
    } = props;
    const resources = sortResources(Object.values(data)).filter(resourceFilter);
    const startsWithVowel = (string) => ['a', 'e', 'i', 'o', 'u'].some((c) => startsWith(string, c));
    return data ? (
        <Form.Select
            disabled={isEmpty(resources)}
            {...rest}
        >
            {isEmpty(resources) ? (
                <option value="">
                    No
                    {resourceNamePlural}
                    {' '}
                    available
                </option>
            ) : (
                <option value="">
                    Select a
                    {startsWithVowel(resourceName) ? 'n' : ''}
                    {' '}
                    {resourceName}
                    ...
                </option>
            )}
            {resources.map(resourceToOption)}
        </Form.Select>
    ) : (
        fetching ? (
            <Form.Text>
                <i className="fa fa-spinner fa-pulse" />
                {'\u00A0'}
                Loading
                {' '}
                {resourceNamePlural}
                ...
            </Form.Text>
        ) : (
            <Form.Text className="text-danger">
                <i className="fa fa-exclamation-triangle" />
                {'\u00A0'}
                Failed to load
                {' '}
                {resourceNamePlural}
            </Form.Text>
        )
    );
};

export const ImageSelectControl = (props) => (
    <ResourceSelectControl resourceName="image" {...props} />
);

export const SizeSelectControl = (props) => (
    <ResourceSelectControl
        resourceName="size"
        resourceToOption={(s) => (
            <option
                key={s.id}
                value={s.id}
                data-subtext={`${s.cpus} cpus, ${s.ram}MB RAM, ${s.disk}GB disk`}
            >
                {s.name}
            </option>
        )}
        sortResources={(sizes) => sortBy(sizes, ['cpus', 'ram', 'disk'])}
        {...props}
    />
);

export const ExternalIpSelectControl = ({
    value, resource, resourceActions, ...props
}) => (
    <InputGroup>
        <ResourceSelectControl
            resource={resource}
            resourceActions={resourceActions}
            resourceName="external ip"
            resourceToOption={(ip) => (
                <option key={ip.external_ip} value={ip.external_ip}>{ip.external_ip}</option>
            )}
            sortResources={(ips) => sortBy(ips, ['external_ip'])}
            // The currently selected IP should be permitted, regardless of state
            resourceFilter={(ip) => (ip.external_ip === value) || (!ip.updating && !ip.machine)}
            value={value}
            {...props}
        />
        <InputGroup.Button>
            <Button
                variant="success"
                disabled={props.disabled || resource.creating}
                onClick={() => resourceActions.create()}
                title="Allocate new IP"
            >
                {resource.creating ? (
                    <i className="fa fa-fw fa-spinner fa-pulse" />
                ) : (
                    <i className="fa fa-fw fa-plus" />
                )}
            </Button>
        </InputGroup.Button>
    </InputGroup>
);

export const VolumeSelectControl = (props) => (
    <ResourceSelectControl resourceName="volume" {...props} />
);

export const MachineSelectControl = (props) => (
    <ResourceSelectControl resourceName="machine" {...props} />
);

export const ClusterSelectControl = (props) => (
    <ResourceSelectControl resourceName="cluster" {...props} />
);
