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
import Select, { components } from 'react-select';

import { Loading } from '../../utils';

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

// Override to allow a caption in the selectpicker.
const Option = (props) => {
    const { title, subTitle } = props.data;
    return (
        <components.Option {...props}>
            <span className="text">
                {title}
                {' '}
                <small className="text-muted">{subTitle}</small>
            </span>
        </components.Option>
    );
};

// Override to hide default caption in the selectpicker.
const SingleValue = (props) => {
    const { title } = props.getValue()[0];
    return (
        <components.SingleValue {...props}>
            <span className="text">{title}</span>
        </components.SingleValue>
    );
};

const ResourceSelectControl = (props) => {
    const {
        resource: { fetching, data },
        resourceActions: _,
        resourceName,
        name = resourceName,
        resourceNamePlural = `${resourceName}s`,
        resourceToOption = (r) => ({ key: r.id, value: r.id, title: r.name }),
        sortResources = (rs) => sortBy(rs, ['name']),
        resourceFilter = (_) => true,
        value,
        ...rest
    } = props;
    const resources = sortResources(Object.values(data)).filter(resourceFilter);
    const startsWithVowel = (string) => ['a', 'e', 'i', 'o', 'u'].some((c) => startsWith(string, c));

    const a = startsWithVowel(resourceName) ? 'an' : 'a';
    const prefix = isEmpty(resources) ? `No ${resourceNamePlural} available` : `Select ${a} ${resourceName}`;
    const optionArray = resources.map(resourceToOption);

    const valueItem = optionArray.find((element) => element.value === value);

    if (data) {
        return (
            <Select
                name={name}
                styles={{
                    control: (provided) => {
                        const borderRadius = 0;
                        return { ...provided, borderRadius };
                    }
                }}
                className="flex-fill"
                inputId={name}
                options={optionArray}
                getOptionLabel={(options) => `${options.title} ${options.subTitle}`}
                components={{ Option, SingleValue }}
                placeholder={prefix}
                isDisabled={props.disabled}
                value={valueItem}
                {...rest}
            />
        );
    } if (fetching) {
        return (
            <Form.Text>
                <i className="fas fa-spinner fa-pulse" />
                {'\u00A0'}
                Loading
                {' '}
                {resourceNamePlural}
                ...
            </Form.Text>
        );
    }
    return (
        <Form.Text className="text-danger">
            <i className="fas fa-exclamation-triangle" />
            {'\u00A0'}
            Failed to load
            {' '}
            {resourceNamePlural}
        </Form.Text>
    );
};

export const ImageSelectControl = (props) => (
    <ResourceSelectControl resourceName="image" {...props} />
);

export const SizeSelectControl = (props) => (
    <ResourceSelectControl
        resourceName="size"
        resourceToOption={(s) => (
            {
                value: s.id,
                key: s.id,
                title: s.name,
                subTitle: `${s.cpus} cpus, ${s.ram}MB RAM, ${s.disk}GB disk`
            }
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
            name="externalIp"
            resourceToOption={(ip) => (
                {
                    value: ip.external_ip,
                    key: ip.external_ip,
                    title: ip.external_ip
                }
            )}
            sortResources={(ips) => sortBy(ips, ['external_ip'])}
            // The currently selected IP should be permitted, regardless of state
            resourceFilter={(ip) => (ip.external_ip === value) || (!ip.updating && !ip.machine)}
            value={value}
            {...props}
        />
        <Button
            variant="success"
            disabled={props.disabled || resource.creating}
            onClick={() => resourceActions.create()}
            title="Allocate new IP"
        >
            {resource.creating ? (
                <i className="fas fa-fw fa-spinner fa-pulse" />
            ) : (
                <i className="fas fa-fw fa-plus" />
            )}
        </Button>
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
