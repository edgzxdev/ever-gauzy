import { Injectable } from '@nestjs/common';
import { FindManyOptions, Between, Raw } from 'typeorm';
import * as moment from 'moment';
import { IPagination } from '@gauzy/contracts';
import { isPostgres } from '@gauzy/config';
import { TenantAwareCrudService } from '@gauzy/core';
import { Proposal } from './proposal.entity';
import { MikroOrmProposalRepository, TypeOrmProposalRepository } from './repository';

@Injectable()
export class ProposalService extends TenantAwareCrudService<Proposal> {
	constructor(
		readonly typeOrmProposalRepository: TypeOrmProposalRepository,
		readonly mikroOrmProposalRepository: MikroOrmProposalRepository
	) {
		super(typeOrmProposalRepository, mikroOrmProposalRepository);
	}

	/**
	 * Retrieves a paginated list of proposals based on optional filtering.
	 *
	 * @param filter Optional filtering criteria for retrieving proposals.
	 * @returns A paginated list of proposals.
	 */
	async findAll(filter?: FindManyOptions<Proposal>): Promise<IPagination<Proposal>> {
		return await this.pagination(filter);
	}

	/**
	 * Paginates data based on the provided filter options.
	 *
	 * @param filter The filter options for pagination.
	 * @returns The paginated data.
	 */
	public async pagination(filter: FindManyOptions) {
		// Check if 'where' property exists in the filter
		if (!('where' in filter)) {
			// If 'where' property is missing, return paginated data without any modification
			return await super.paginate(filter);
		}

		const { where } = filter;

		// Determine the appropriate like operator based on the database type
		const likeOperator = isPostgres() ? 'ILIKE' : 'LIKE';

		if ('valueDate' in where) {
			const { valueDate } = where;
			// If 'valueDate' property exists, extract start and end dates
			const { startDate, endDate } = valueDate;

			// Get the start and end of the current month in UTC format
			const startOfCurrentMonth = moment().startOf('month').utc().format('YYYY-MM-DD HH:mm:ss');
			const endOfCurrentMonth = moment().endOf('month').utc().format('YYYY-MM-DD HH:mm:ss');

			// Update the 'valueDate' property to filter records between the specified dates
			filter['where']['valueDate'] = Between(
				startDate ? moment.utc(startDate).format('YYYY-MM-DD HH:mm:ss') : startOfCurrentMonth,
				endDate ? moment.utc(endDate).format('YYYY-MM-DD HH:mm:ss') : endOfCurrentMonth
			);
		}

		// Check if 'jobPostContent' property exists in the 'where' filter
		if ('jobPostContent' in where) {
			// If 'jobPostContent' property exists, construct a raw SQL query to perform a like search
			const { jobPostContent } = where;
			filter['where']['jobPostContent'] = Raw(alias => `${alias} ${likeOperator} '%${jobPostContent}%'`);
		}

		// Return the paginated data after applying any modifications
		return await super.paginate(filter);
	}
}
