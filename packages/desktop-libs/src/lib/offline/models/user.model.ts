import { IEmployee } from '@gauzy/contracts';
import { UserTO } from '../dto/user.dto';
import { Base } from './base.model';

export class User extends Base implements UserTO {
	private _email: string;
	private _employee: Partial<IEmployee>;
	private _employeeId: string;
	private _name: string;

	constructor(
		email: string,
		employee: Partial<IEmployee>,
		employeeId: string,
		name: string,
		id?: number,
		organizationId?: string,
		remoteId?: string,
		tenantId?: string
	) {
		super(id, organizationId, remoteId, tenantId);
		this._email = email;
		this._employee = employee;
		this._employeeId = employeeId;
		this._name = name;
	}

	public get email(): string {
		return this._email;
	}
	public set email(value: string) {
		this._email = value;
	}
	public get employee(): Partial<IEmployee> {
		return this._employee;
	}
	public set employee(value: Partial<IEmployee>) {
		this._employee = value;
	}
	public get employeeId(): string {
		return this._employeeId;
	}
	public set employeeId(value: string) {
		this._employeeId = value;
	}
	public get name(): string {
		return this._name;
	}
	public set name(value: string) {
		this._name = value;
	}
}
