export const datasetsSql = 'SELECT * FROM syn16859580'
export const publicationsSql = 'SELECT * FROM syn16857542'
export const studiesSql = 'SELECT * FROM syn16787123'
export const initiativesSql = 'SELECT * FROM syn24189696'
export const toolsSql = 'SELECT * FROM syn26345844'
export const peopleSql = 'SELECT * FROM syn23564971'
export const filesSql = `SELECT id AS "File ID", assay, dataType, diagnosis, tumorType,  species, individualID,  fileFormat, dataSubtype, nf1Genotype as "NF1 Genotype", nf2Genotype as "NF2 Genotype", studyName, fundingAgency, consortium, name AS "File Name", accessType, accessTeam  FROM syn16858331.6 WHERE resourceType = 'experimentalData'`
export const metadataFilesSql = `SELECT id, dataType, assay, diagnosis, tumorType, species, individualID, fileFormat, dataSubtype, nf1Genotype, nf2Genotype, fundingAgency, consortium FROM syn16858331.6 where resourceType ='report'`
export const fundersSql = 'SELECT * FROM syn16858699'
export const hackathonsSql = 'SELECT * FROM syn25585549'
export const observationsSql = 'SELECT "Observation Submitter Name" as "submitterName", Synapse_id as "submitterUserId", "Observation Time" as "time", "Observation Time Units" as "timeUnits", "Observation Text" as "text", "Observation Type" as "tag" FROM syn26344832 '
export const investigatorSql = `SELECT "Investigator Name" as "firstName", ' ' as "lastName", "Institution" as "institution", "Investigator SynapseId" as "USERID" FROM syn26344827`
export const developmentPublicationSql = `SELECT doi as "Development Publication" FROM syn26344828`
export const publicationCitationSql = `SELECT citation as "Publication Citation" FROM syn26344828`
export const fundingAgencySql = `SELECT "Funder Name" as "Funding Agency" FROM syn26344829`
export const usageRequirementsSql = `SELECT usageRequirements as "Usage Restrictions" FROM syn26433342`
export const vendorSql = `SELECT "Vendor Name" as "Vendor", "Vendor Url" FROM syn26344830`
