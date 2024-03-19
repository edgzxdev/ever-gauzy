import { IOrganizationContact, IOrganizationProject } from '@gauzy/contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isEmpty, isNotEmpty } from '@gauzy/common';
import { In } from 'typeorm';
import { OrganizationContactCreateCommand } from '../organization-contact-create.command';
import { OrganizationContactService } from '../../organization-contact.service';
import { OrganizationProjectService } from './../../../organization-project/organization-project.service';
import { RequestContext } from './../../../core/context';

@CommandHandler(OrganizationContactCreateCommand)
export class OrganizationContactCreateHandler implements ICommandHandler<OrganizationContactCreateCommand> {

	constructor(
		private readonly organizationContactService: OrganizationContactService,
		private readonly organizationProjectService: OrganizationProjectService
	) { }

	/**
	 * Executes the creation of an organization contact.
	 *
	 * @param command An instance of OrganizationContactCreateCommand containing the necessary input for creating a new organization contact.
	 * @returns A promise that resolves to the newly created organization contact (IOrganizationContact).
	 */
	public async execute(command: OrganizationContactCreateCommand): Promise<IOrganizationContact> {
		try {
			// Destructure the input from the command.
			const { input } = command;
			// Destructure organizationId from the input, and get tenantId either from the current RequestContext or from the input.
			const { organizationId } = input;
			const tenantId = RequestContext.currentTenantId() || input.tenantId;

			// Check if the input members are empty and projects are defined.
			if (isEmpty(input.members) && isNotEmpty(input.projects)) {
				// Map the projects to their IDs.
				const projectIds = input.projects.map((project) => project.id);

				// Retrieve projects with specified IDs, belonging to the given organization and tenant.
				const projects = await this.organizationProjectService.find({
					where: {
						id: In(projectIds),
						organization: { id: organizationId },
						tenantId
					},
					relations: { members: true }
				});

				// Flatten the members from these projects and assign them to input.members.
				input.members = projects.flatMap((project: IOrganizationProject) => project.members);
			}

			// Create a new organization contact with the modified input.
			return await this.organizationContactService.create({
				...input,
				organization: { id: organizationId }
			});
		} catch (error) {
			console.error('Error while creating new organization contact', error);
		}
	}
}
