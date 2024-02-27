// @ts-nocheck
import { getBackendSrv } from '@grafana/runtime';
import {
	HorizontalGroup,
	Button,
	InlineField,
} from '@grafana/ui';
import { Constant } from 'api/Consant';
import { getAlert } from 'api/monitorAPI';

import React, { useState, useEffect } from 'react';
import { OrderBookPanelOptions } from 'types';

interface Props extends OrderBookPanelOptions { }

let checkInterval: any;

export const AlertPanel: React.FC<Props> = ({ width, height }) => {

	const [alert, setAlert] = useState<[]>([])

	useEffect(() => {
		getAlert().then(data => {
			setAlert(data)
		});
		checkInterval = setInterval(async () => {
			let data: any = await getAlert();
			setAlert(data)
		}, 30000)
		return () => {
			clearInterval(checkInterval);
		}
	}, [])

	return (
		<HorizontalGroup
			justify="flex-start"
			align="center"
			style={{ width, height, overflow: 'auto', padding: 0, margin: 0 }}
		>
			<div
				id="fss-table-wrapper"
				style={{ overflow: 'auto', width, height }}
			>
				<table style={{ width: '100%' }} id="fsstable">
					<thead>
						<tr>
							<th>Name</th>
							<th>1st detect at</th>
							<th>Instance</th>
							<th>Job</th>
						</tr>
					</thead>
					<tbody>
						{alert.map((e: any) => (
							<tr>
								<td>{e.labels.alertname}</td>
								<td>{e.endsAt}</td>
								<td>{e.labels.instance}</td>
								<td>{e.labels.job}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</HorizontalGroup>
	);
};