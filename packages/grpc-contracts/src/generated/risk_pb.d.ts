// package: treum.risk
// file: risk.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class AssessTradeRiskRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): AssessTradeRiskRequest;
    getAccountId(): string;
    setAccountId(value: string): AssessTradeRiskRequest;
    getTradeId(): string;
    setTradeId(value: string): AssessTradeRiskRequest;
    getSymbol(): string;
    setSymbol(value: string): AssessTradeRiskRequest;
    getAssetType(): string;
    setAssetType(value: string): AssessTradeRiskRequest;
    getSide(): TradeSide;
    setSide(value: TradeSide): AssessTradeRiskRequest;
    getQuantity(): number;
    setQuantity(value: number): AssessTradeRiskRequest;
    getPrice(): number;
    setPrice(value: number): AssessTradeRiskRequest;
    getStopLoss(): number;
    setStopLoss(value: number): AssessTradeRiskRequest;
    getTakeProfit(): number;
    setTakeProfit(value: number): AssessTradeRiskRequest;
    getLeverage(): number;
    setLeverage(value: number): AssessTradeRiskRequest;
    getPortfolioValue(): number;
    setPortfolioValue(value: number): AssessTradeRiskRequest;
    getAvailableBalance(): number;
    setAvailableBalance(value: number): AssessTradeRiskRequest;
    clearExistingPositionsList(): void;
    getExistingPositionsList(): Array<Position>;
    setExistingPositionsList(value: Array<Position>): AssessTradeRiskRequest;
    addExistingPositions(value?: Position, index?: number): Position;

    hasMarketData(): boolean;
    clearMarketData(): void;
    getMarketData(): MarketData | undefined;
    setMarketData(value?: MarketData): AssessTradeRiskRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AssessTradeRiskRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AssessTradeRiskRequest): AssessTradeRiskRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AssessTradeRiskRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AssessTradeRiskRequest;
    static deserializeBinaryFromReader(message: AssessTradeRiskRequest, reader: jspb.BinaryReader): AssessTradeRiskRequest;
}

export namespace AssessTradeRiskRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        tradeId: string,
        symbol: string,
        assetType: string,
        side: TradeSide,
        quantity: number,
        price: number,
        stopLoss: number,
        takeProfit: number,
        leverage: number,
        portfolioValue: number,
        availableBalance: number,
        existingPositionsList: Array<Position.AsObject>,
        marketData?: MarketData.AsObject,
    }
}

export class Position extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): Position;
    getQuantity(): number;
    setQuantity(value: number): Position;
    getMarketValue(): number;
    setMarketValue(value: number): Position;
    getUnrealizedPnl(): number;
    setUnrealizedPnl(value: number): Position;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Position.AsObject;
    static toObject(includeInstance: boolean, msg: Position): Position.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Position, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Position;
    static deserializeBinaryFromReader(message: Position, reader: jspb.BinaryReader): Position;
}

export namespace Position {
    export type AsObject = {
        symbol: string,
        quantity: number,
        marketValue: number,
        unrealizedPnl: number,
    }
}

export class MarketData extends jspb.Message { 
    getVolatility(): number;
    setVolatility(value: number): MarketData;
    getLiquidity(): number;
    setLiquidity(value: number): MarketData;
    getBeta(): number;
    setBeta(value: number): MarketData;
    getCorrelation(): number;
    setCorrelation(value: number): MarketData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarketData.AsObject;
    static toObject(includeInstance: boolean, msg: MarketData): MarketData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarketData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarketData;
    static deserializeBinaryFromReader(message: MarketData, reader: jspb.BinaryReader): MarketData;
}

export namespace MarketData {
    export type AsObject = {
        volatility: number,
        liquidity: number,
        beta: number,
        correlation: number,
    }
}

export class TradeRiskResponse extends jspb.Message { 
    getRiskLevel(): RiskLevel;
    setRiskLevel(value: RiskLevel): TradeRiskResponse;
    getRiskScore(): number;
    setRiskScore(value: number): TradeRiskResponse;
    clearRiskFactorsList(): void;
    getRiskFactorsList(): Array<RiskFactor>;
    setRiskFactorsList(value: Array<RiskFactor>): TradeRiskResponse;
    addRiskFactors(value?: RiskFactor, index?: number): RiskFactor;
    clearRecommendationsList(): void;
    getRecommendationsList(): Array<string>;
    setRecommendationsList(value: Array<string>): TradeRiskResponse;
    addRecommendations(value: string, index?: number): string;
    clearWarningsList(): void;
    getWarningsList(): Array<string>;
    setWarningsList(value: Array<string>): TradeRiskResponse;
    addWarnings(value: string, index?: number): string;
    getApproved(): boolean;
    setApproved(value: boolean): TradeRiskResponse;
    getMaxPositionSize(): number;
    setMaxPositionSize(value: number): TradeRiskResponse;
    getSuggestedStopLoss(): number;
    setSuggestedStopLoss(value: number): TradeRiskResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradeRiskResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TradeRiskResponse): TradeRiskResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradeRiskResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradeRiskResponse;
    static deserializeBinaryFromReader(message: TradeRiskResponse, reader: jspb.BinaryReader): TradeRiskResponse;
}

export namespace TradeRiskResponse {
    export type AsObject = {
        riskLevel: RiskLevel,
        riskScore: number,
        riskFactorsList: Array<RiskFactor.AsObject>,
        recommendationsList: Array<string>,
        warningsList: Array<string>,
        approved: boolean,
        maxPositionSize: number,
        suggestedStopLoss: number,
    }
}

export class RiskFactor extends jspb.Message { 
    getFactor(): string;
    setFactor(value: string): RiskFactor;
    getValue(): number;
    setValue(value: number): RiskFactor;
    getWeight(): number;
    setWeight(value: number): RiskFactor;
    getContribution(): number;
    setContribution(value: number): RiskFactor;
    getDescription(): string;
    setDescription(value: string): RiskFactor;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RiskFactor.AsObject;
    static toObject(includeInstance: boolean, msg: RiskFactor): RiskFactor.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RiskFactor, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RiskFactor;
    static deserializeBinaryFromReader(message: RiskFactor, reader: jspb.BinaryReader): RiskFactor;
}

export namespace RiskFactor {
    export type AsObject = {
        factor: string,
        value: number,
        weight: number,
        contribution: number,
        description: string,
    }
}

export class CalculatePortfolioRiskRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CalculatePortfolioRiskRequest;
    getAccountId(): string;
    setAccountId(value: string): CalculatePortfolioRiskRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): CalculatePortfolioRiskRequest;
    getTotalValue(): number;
    setTotalValue(value: number): CalculatePortfolioRiskRequest;
    getAvailableBalance(): number;
    setAvailableBalance(value: number): CalculatePortfolioRiskRequest;
    getUsedMargin(): number;
    setUsedMargin(value: number): CalculatePortfolioRiskRequest;
    getLeverage(): number;
    setLeverage(value: number): CalculatePortfolioRiskRequest;
    clearPositionsList(): void;
    getPositionsList(): Array<PortfolioPosition>;
    setPositionsList(value: Array<PortfolioPosition>): CalculatePortfolioRiskRequest;
    addPositions(value?: PortfolioPosition, index?: number): PortfolioPosition;
    clearHistoricalReturnsList(): void;
    getHistoricalReturnsList(): Array<number>;
    setHistoricalReturnsList(value: Array<number>): CalculatePortfolioRiskRequest;
    addHistoricalReturns(value: number, index?: number): number;
    clearBenchmarkReturnsList(): void;
    getBenchmarkReturnsList(): Array<number>;
    setBenchmarkReturnsList(value: Array<number>): CalculatePortfolioRiskRequest;
    addBenchmarkReturns(value: number, index?: number): number;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CalculatePortfolioRiskRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CalculatePortfolioRiskRequest): CalculatePortfolioRiskRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CalculatePortfolioRiskRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CalculatePortfolioRiskRequest;
    static deserializeBinaryFromReader(message: CalculatePortfolioRiskRequest, reader: jspb.BinaryReader): CalculatePortfolioRiskRequest;
}

export namespace CalculatePortfolioRiskRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        totalValue: number,
        availableBalance: number,
        usedMargin: number,
        leverage: number,
        positionsList: Array<PortfolioPosition.AsObject>,
        historicalReturnsList: Array<number>,
        benchmarkReturnsList: Array<number>,
    }
}

export class PortfolioPosition extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): PortfolioPosition;
    getAssetType(): string;
    setAssetType(value: string): PortfolioPosition;
    getQuantity(): number;
    setQuantity(value: number): PortfolioPosition;
    getAveragePrice(): number;
    setAveragePrice(value: number): PortfolioPosition;
    getCurrentPrice(): number;
    setCurrentPrice(value: number): PortfolioPosition;
    getMarketValue(): number;
    setMarketValue(value: number): PortfolioPosition;
    getUnrealizedPnl(): number;
    setUnrealizedPnl(value: number): PortfolioPosition;
    getSector(): string;
    setSector(value: string): PortfolioPosition;
    getCurrency(): string;
    setCurrency(value: string): PortfolioPosition;
    getBeta(): number;
    setBeta(value: number): PortfolioPosition;
    getVolatility(): number;
    setVolatility(value: number): PortfolioPosition;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PortfolioPosition.AsObject;
    static toObject(includeInstance: boolean, msg: PortfolioPosition): PortfolioPosition.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PortfolioPosition, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PortfolioPosition;
    static deserializeBinaryFromReader(message: PortfolioPosition, reader: jspb.BinaryReader): PortfolioPosition;
}

export namespace PortfolioPosition {
    export type AsObject = {
        symbol: string,
        assetType: string,
        quantity: number,
        averagePrice: number,
        currentPrice: number,
        marketValue: number,
        unrealizedPnl: number,
        sector: string,
        currency: string,
        beta: number,
        volatility: number,
    }
}

export class PortfolioRiskResponse extends jspb.Message { 

    hasValueAtRisk(): boolean;
    clearValueAtRisk(): void;
    getValueAtRisk(): ValueAtRisk | undefined;
    setValueAtRisk(value?: ValueAtRisk): PortfolioRiskResponse;

    hasExpectedShortfall(): boolean;
    clearExpectedShortfall(): void;
    getExpectedShortfall(): ExpectedShortfall | undefined;
    setExpectedShortfall(value?: ExpectedShortfall): PortfolioRiskResponse;

    hasVolatility(): boolean;
    clearVolatility(): void;
    getVolatility(): Volatility | undefined;
    setVolatility(value?: Volatility): PortfolioRiskResponse;
    getSharpeRatio(): number;
    setSharpeRatio(value: number): PortfolioRiskResponse;
    getSortinoRatio(): number;
    setSortinoRatio(value: number): PortfolioRiskResponse;
    getMaximumDrawdown(): number;
    setMaximumDrawdown(value: number): PortfolioRiskResponse;
    getBeta(): number;
    setBeta(value: number): PortfolioRiskResponse;

    hasConcentration(): boolean;
    clearConcentration(): void;
    getConcentration(): ConcentrationRisk | undefined;
    setConcentration(value?: ConcentrationRisk): PortfolioRiskResponse;

    getSectorExposureMap(): jspb.Map<string, number>;
    clearSectorExposureMap(): void;

    getCurrencyExposureMap(): jspb.Map<string, number>;
    clearCurrencyExposureMap(): void;
    getLeverageRatio(): number;
    setLeverageRatio(value: number): PortfolioRiskResponse;
    getMarginUtilization(): number;
    setMarginUtilization(value: number): PortfolioRiskResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PortfolioRiskResponse.AsObject;
    static toObject(includeInstance: boolean, msg: PortfolioRiskResponse): PortfolioRiskResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PortfolioRiskResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PortfolioRiskResponse;
    static deserializeBinaryFromReader(message: PortfolioRiskResponse, reader: jspb.BinaryReader): PortfolioRiskResponse;
}

export namespace PortfolioRiskResponse {
    export type AsObject = {
        valueAtRisk?: ValueAtRisk.AsObject,
        expectedShortfall?: ExpectedShortfall.AsObject,
        volatility?: Volatility.AsObject,
        sharpeRatio: number,
        sortinoRatio: number,
        maximumDrawdown: number,
        beta: number,
        concentration?: ConcentrationRisk.AsObject,

        sectorExposureMap: Array<[string, number]>,

        currencyExposureMap: Array<[string, number]>,
        leverageRatio: number,
        marginUtilization: number,
    }
}

export class ValueAtRisk extends jspb.Message { 
    getVar95(): number;
    setVar95(value: number): ValueAtRisk;
    getVar99(): number;
    setVar99(value: number): ValueAtRisk;
    getVar999(): number;
    setVar999(value: number): ValueAtRisk;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ValueAtRisk.AsObject;
    static toObject(includeInstance: boolean, msg: ValueAtRisk): ValueAtRisk.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ValueAtRisk, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ValueAtRisk;
    static deserializeBinaryFromReader(message: ValueAtRisk, reader: jspb.BinaryReader): ValueAtRisk;
}

export namespace ValueAtRisk {
    export type AsObject = {
        var95: number,
        var99: number,
        var999: number,
    }
}

export class ExpectedShortfall extends jspb.Message { 
    getEs95(): number;
    setEs95(value: number): ExpectedShortfall;
    getEs99(): number;
    setEs99(value: number): ExpectedShortfall;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ExpectedShortfall.AsObject;
    static toObject(includeInstance: boolean, msg: ExpectedShortfall): ExpectedShortfall.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ExpectedShortfall, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ExpectedShortfall;
    static deserializeBinaryFromReader(message: ExpectedShortfall, reader: jspb.BinaryReader): ExpectedShortfall;
}

export namespace ExpectedShortfall {
    export type AsObject = {
        es95: number,
        es99: number,
    }
}

export class Volatility extends jspb.Message { 
    getDaily(): number;
    setDaily(value: number): Volatility;
    getAnnualized(): number;
    setAnnualized(value: number): Volatility;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Volatility.AsObject;
    static toObject(includeInstance: boolean, msg: Volatility): Volatility.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Volatility, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Volatility;
    static deserializeBinaryFromReader(message: Volatility, reader: jspb.BinaryReader): Volatility;
}

export namespace Volatility {
    export type AsObject = {
        daily: number,
        annualized: number,
    }
}

export class ConcentrationRisk extends jspb.Message { 
    getHerfindahlIndex(): number;
    setHerfindahlIndex(value: number): ConcentrationRisk;
    getTopPositionWeight(): number;
    setTopPositionWeight(value: number): ConcentrationRisk;
    getTop5PositionWeight(): number;
    setTop5PositionWeight(value: number): ConcentrationRisk;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConcentrationRisk.AsObject;
    static toObject(includeInstance: boolean, msg: ConcentrationRisk): ConcentrationRisk.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConcentrationRisk, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConcentrationRisk;
    static deserializeBinaryFromReader(message: ConcentrationRisk, reader: jspb.BinaryReader): ConcentrationRisk;
}

export namespace ConcentrationRisk {
    export type AsObject = {
        herfindahlIndex: number,
        topPositionWeight: number,
        top5PositionWeight: number,
    }
}

export class KYCCheckRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): KYCCheckRequest;

    hasPersonalInfo(): boolean;
    clearPersonalInfo(): void;
    getPersonalInfo(): PersonalInfo | undefined;
    setPersonalInfo(value?: PersonalInfo): KYCCheckRequest;
    clearDocumentsList(): void;
    getDocumentsList(): Array<Document>;
    setDocumentsList(value: Array<Document>): KYCCheckRequest;
    addDocuments(value?: Document, index?: number): Document;
    getRiskProfile(): RiskProfile;
    setRiskProfile(value: RiskProfile): KYCCheckRequest;
    getInvestmentExperience(): InvestmentExperience;
    setInvestmentExperience(value: InvestmentExperience): KYCCheckRequest;
    getEstimatedNetWorth(): number;
    setEstimatedNetWorth(value: number): KYCCheckRequest;
    getAnnualIncome(): number;
    setAnnualIncome(value: number): KYCCheckRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): KYCCheckRequest.AsObject;
    static toObject(includeInstance: boolean, msg: KYCCheckRequest): KYCCheckRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: KYCCheckRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): KYCCheckRequest;
    static deserializeBinaryFromReader(message: KYCCheckRequest, reader: jspb.BinaryReader): KYCCheckRequest;
}

export namespace KYCCheckRequest {
    export type AsObject = {
        userId: string,
        personalInfo?: PersonalInfo.AsObject,
        documentsList: Array<Document.AsObject>,
        riskProfile: RiskProfile,
        investmentExperience: InvestmentExperience,
        estimatedNetWorth: number,
        annualIncome: number,
    }
}

export class PersonalInfo extends jspb.Message { 
    getFullName(): string;
    setFullName(value: string): PersonalInfo;
    getDateOfBirth(): string;
    setDateOfBirth(value: string): PersonalInfo;
    getNationality(): string;
    setNationality(value: string): PersonalInfo;

    hasAddress(): boolean;
    clearAddress(): void;
    getAddress(): Address | undefined;
    setAddress(value?: Address): PersonalInfo;
    getPhone(): string;
    setPhone(value: string): PersonalInfo;
    getEmail(): string;
    setEmail(value: string): PersonalInfo;
    getTaxId(): string;
    setTaxId(value: string): PersonalInfo;
    getPassportNumber(): string;
    setPassportNumber(value: string): PersonalInfo;
    getDrivingLicenseNumber(): string;
    setDrivingLicenseNumber(value: string): PersonalInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PersonalInfo.AsObject;
    static toObject(includeInstance: boolean, msg: PersonalInfo): PersonalInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PersonalInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PersonalInfo;
    static deserializeBinaryFromReader(message: PersonalInfo, reader: jspb.BinaryReader): PersonalInfo;
}

export namespace PersonalInfo {
    export type AsObject = {
        fullName: string,
        dateOfBirth: string,
        nationality: string,
        address?: Address.AsObject,
        phone: string,
        email: string,
        taxId: string,
        passportNumber: string,
        drivingLicenseNumber: string,
    }
}

export class Address extends jspb.Message { 
    getStreet(): string;
    setStreet(value: string): Address;
    getCity(): string;
    setCity(value: string): Address;
    getState(): string;
    setState(value: string): Address;
    getCountry(): string;
    setCountry(value: string): Address;
    getPostalCode(): string;
    setPostalCode(value: string): Address;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Address.AsObject;
    static toObject(includeInstance: boolean, msg: Address): Address.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Address, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Address;
    static deserializeBinaryFromReader(message: Address, reader: jspb.BinaryReader): Address;
}

export namespace Address {
    export type AsObject = {
        street: string,
        city: string,
        state: string,
        country: string,
        postalCode: string,
    }
}

export class Document extends jspb.Message { 
    getType(): DocumentType;
    setType(value: DocumentType): Document;
    getUrl(): string;
    setUrl(value: string): Document;
    getVerified(): boolean;
    setVerified(value: boolean): Document;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Document.AsObject;
    static toObject(includeInstance: boolean, msg: Document): Document.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Document, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Document;
    static deserializeBinaryFromReader(message: Document, reader: jspb.BinaryReader): Document;
}

export namespace Document {
    export type AsObject = {
        type: DocumentType,
        url: string,
        verified: boolean,
    }
}

export class AMLCheckRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): AMLCheckRequest;

    hasTransactionData(): boolean;
    clearTransactionData(): void;
    getTransactionData(): TransactionData | undefined;
    setTransactionData(value?: TransactionData): AMLCheckRequest;

    hasUserProfile(): boolean;
    clearUserProfile(): void;
    getUserProfile(): UserProfile | undefined;
    setUserProfile(value?: UserProfile): AMLCheckRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AMLCheckRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AMLCheckRequest): AMLCheckRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AMLCheckRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AMLCheckRequest;
    static deserializeBinaryFromReader(message: AMLCheckRequest, reader: jspb.BinaryReader): AMLCheckRequest;
}

export namespace AMLCheckRequest {
    export type AsObject = {
        userId: string,
        transactionData?: TransactionData.AsObject,
        userProfile?: UserProfile.AsObject,
    }
}

export class TransactionData extends jspb.Message { 
    getAmount(): number;
    setAmount(value: number): TransactionData;
    getCurrency(): string;
    setCurrency(value: string): TransactionData;
    getSourceOfFunds(): string;
    setSourceOfFunds(value: string): TransactionData;
    getDestinationAccount(): string;
    setDestinationAccount(value: string): TransactionData;
    getPurpose(): string;
    setPurpose(value: string): TransactionData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TransactionData.AsObject;
    static toObject(includeInstance: boolean, msg: TransactionData): TransactionData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TransactionData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TransactionData;
    static deserializeBinaryFromReader(message: TransactionData, reader: jspb.BinaryReader): TransactionData;
}

export namespace TransactionData {
    export type AsObject = {
        amount: number,
        currency: string,
        sourceOfFunds: string,
        destinationAccount: string,
        purpose: string,
    }
}

export class UserProfile extends jspb.Message { 
    getRiskRating(): number;
    setRiskRating(value: number): UserProfile;
    clearPreviousTransactionsList(): void;
    getPreviousTransactionsList(): Array<PreviousTransaction>;
    setPreviousTransactionsList(value: Array<PreviousTransaction>): UserProfile;
    addPreviousTransactions(value?: PreviousTransaction, index?: number): PreviousTransaction;
    getGeographicRisk(): GeographicRisk;
    setGeographicRisk(value: GeographicRisk): UserProfile;
    getBusinessRelationshipDuration(): number;
    setBusinessRelationshipDuration(value: number): UserProfile;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserProfile.AsObject;
    static toObject(includeInstance: boolean, msg: UserProfile): UserProfile.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserProfile, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserProfile;
    static deserializeBinaryFromReader(message: UserProfile, reader: jspb.BinaryReader): UserProfile;
}

export namespace UserProfile {
    export type AsObject = {
        riskRating: number,
        previousTransactionsList: Array<PreviousTransaction.AsObject>,
        geographicRisk: GeographicRisk,
        businessRelationshipDuration: number,
    }
}

export class PreviousTransaction extends jspb.Message { 
    getAmount(): number;
    setAmount(value: number): PreviousTransaction;

    hasDate(): boolean;
    clearDate(): void;
    getDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setDate(value?: google_protobuf_timestamp_pb.Timestamp): PreviousTransaction;
    getType(): string;
    setType(value: string): PreviousTransaction;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PreviousTransaction.AsObject;
    static toObject(includeInstance: boolean, msg: PreviousTransaction): PreviousTransaction.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PreviousTransaction, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PreviousTransaction;
    static deserializeBinaryFromReader(message: PreviousTransaction, reader: jspb.BinaryReader): PreviousTransaction;
}

export namespace PreviousTransaction {
    export type AsObject = {
        amount: number,
        date?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        type: string,
    }
}

export class TradeComplianceCheckRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): TradeComplianceCheckRequest;
    getAccountId(): string;
    setAccountId(value: string): TradeComplianceCheckRequest;

    hasTradeData(): boolean;
    clearTradeData(): void;
    getTradeData(): TradeData | undefined;
    setTradeData(value?: TradeData): TradeComplianceCheckRequest;

    hasMarketData(): boolean;
    clearMarketData(): void;
    getMarketData(): MarketDataForCompliance | undefined;
    setMarketData(value?: MarketDataForCompliance): TradeComplianceCheckRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradeComplianceCheckRequest.AsObject;
    static toObject(includeInstance: boolean, msg: TradeComplianceCheckRequest): TradeComplianceCheckRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradeComplianceCheckRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradeComplianceCheckRequest;
    static deserializeBinaryFromReader(message: TradeComplianceCheckRequest, reader: jspb.BinaryReader): TradeComplianceCheckRequest;
}

export namespace TradeComplianceCheckRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        tradeData?: TradeData.AsObject,
        marketData?: MarketDataForCompliance.AsObject,
    }
}

export class TradeData extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): TradeData;
    getSide(): TradeSide;
    setSide(value: TradeSide): TradeData;
    getQuantity(): number;
    setQuantity(value: number): TradeData;
    getPrice(): number;
    setPrice(value: number): TradeData;
    getOrderType(): string;
    setOrderType(value: string): TradeData;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): TradeData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradeData.AsObject;
    static toObject(includeInstance: boolean, msg: TradeData): TradeData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradeData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradeData;
    static deserializeBinaryFromReader(message: TradeData, reader: jspb.BinaryReader): TradeData;
}

export namespace TradeData {
    export type AsObject = {
        symbol: string,
        side: TradeSide,
        quantity: number,
        price: number,
        orderType: string,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class MarketDataForCompliance extends jspb.Message { 
    getVolume(): number;
    setVolume(value: number): MarketDataForCompliance;
    getVolatility(): number;
    setVolatility(value: number): MarketDataForCompliance;
    getPriceMovement(): number;
    setPriceMovement(value: number): MarketDataForCompliance;
    getTimeOfDay(): string;
    setTimeOfDay(value: string): MarketDataForCompliance;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarketDataForCompliance.AsObject;
    static toObject(includeInstance: boolean, msg: MarketDataForCompliance): MarketDataForCompliance.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarketDataForCompliance, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarketDataForCompliance;
    static deserializeBinaryFromReader(message: MarketDataForCompliance, reader: jspb.BinaryReader): MarketDataForCompliance;
}

export namespace MarketDataForCompliance {
    export type AsObject = {
        volume: number,
        volatility: number,
        priceMovement: number,
        timeOfDay: string,
    }
}

export class ComplianceCheckResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): ComplianceCheckResponse;
    getUserId(): string;
    setUserId(value: string): ComplianceCheckResponse;
    getAccountId(): string;
    setAccountId(value: string): ComplianceCheckResponse;
    getComplianceType(): ComplianceType;
    setComplianceType(value: ComplianceType): ComplianceCheckResponse;
    getStatus(): ComplianceStatus;
    setStatus(value: ComplianceStatus): ComplianceCheckResponse;
    getSeverity(): ComplianceSeverity;
    setSeverity(value: ComplianceSeverity): ComplianceCheckResponse;

    hasCheckResults(): boolean;
    clearCheckResults(): void;
    getCheckResults(): ComplianceResults | undefined;
    setCheckResults(value?: ComplianceResults): ComplianceCheckResponse;
    clearRulesEvaluatedList(): void;
    getRulesEvaluatedList(): Array<string>;
    setRulesEvaluatedList(value: Array<string>): ComplianceCheckResponse;
    addRulesEvaluated(value: string, index?: number): string;
    clearFailedRulesList(): void;
    getFailedRulesList(): Array<string>;
    setFailedRulesList(value: Array<string>): ComplianceCheckResponse;
    addFailedRules(value: string, index?: number): string;
    clearRegulatoryRefsList(): void;
    getRegulatoryRefsList(): Array<string>;
    setRegulatoryRefsList(value: Array<string>): ComplianceCheckResponse;
    addRegulatoryRefs(value: string, index?: number): string;
    clearRemedialActionsList(): void;
    getRemedialActionsList(): Array<string>;
    setRemedialActionsList(value: Array<string>): ComplianceCheckResponse;
    addRemedialActions(value: string, index?: number): string;

    hasNextReviewDate(): boolean;
    clearNextReviewDate(): void;
    getNextReviewDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setNextReviewDate(value?: google_protobuf_timestamp_pb.Timestamp): ComplianceCheckResponse;
    getProcessingTimeMs(): number;
    setProcessingTimeMs(value: number): ComplianceCheckResponse;
    getRequiresEscalation(): boolean;
    setRequiresEscalation(value: boolean): ComplianceCheckResponse;
    getEscalationReason(): string;
    setEscalationReason(value: string): ComplianceCheckResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ComplianceCheckResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ComplianceCheckResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComplianceCheckResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ComplianceCheckResponse): ComplianceCheckResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComplianceCheckResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComplianceCheckResponse;
    static deserializeBinaryFromReader(message: ComplianceCheckResponse, reader: jspb.BinaryReader): ComplianceCheckResponse;
}

export namespace ComplianceCheckResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        complianceType: ComplianceType,
        status: ComplianceStatus,
        severity: ComplianceSeverity,
        checkResults?: ComplianceResults.AsObject,
        rulesEvaluatedList: Array<string>,
        failedRulesList: Array<string>,
        regulatoryRefsList: Array<string>,
        remedialActionsList: Array<string>,
        nextReviewDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        processingTimeMs: number,
        requiresEscalation: boolean,
        escalationReason: string,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ComplianceResults extends jspb.Message { 
    getPassed(): boolean;
    setPassed(value: boolean): ComplianceResults;
    getScore(): number;
    setScore(value: number): ComplianceResults;
    clearFlagsList(): void;
    getFlagsList(): Array<ComplianceFlag>;
    setFlagsList(value: Array<ComplianceFlag>): ComplianceResults;
    addFlags(value?: ComplianceFlag, index?: number): ComplianceFlag;
    getEvidence(): string;
    setEvidence(value: string): ComplianceResults;
    clearExternalSourcesList(): void;
    getExternalSourcesList(): Array<string>;
    setExternalSourcesList(value: Array<string>): ComplianceResults;
    addExternalSources(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComplianceResults.AsObject;
    static toObject(includeInstance: boolean, msg: ComplianceResults): ComplianceResults.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComplianceResults, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComplianceResults;
    static deserializeBinaryFromReader(message: ComplianceResults, reader: jspb.BinaryReader): ComplianceResults;
}

export namespace ComplianceResults {
    export type AsObject = {
        passed: boolean,
        score: number,
        flagsList: Array<ComplianceFlag.AsObject>,
        evidence: string,
        externalSourcesList: Array<string>,
    }
}

export class ComplianceFlag extends jspb.Message { 
    getFlag(): string;
    setFlag(value: string): ComplianceFlag;
    getSeverity(): string;
    setSeverity(value: string): ComplianceFlag;
    getDescription(): string;
    setDescription(value: string): ComplianceFlag;
    getValue(): string;
    setValue(value: string): ComplianceFlag;
    getThreshold(): string;
    setThreshold(value: string): ComplianceFlag;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComplianceFlag.AsObject;
    static toObject(includeInstance: boolean, msg: ComplianceFlag): ComplianceFlag.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComplianceFlag, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComplianceFlag;
    static deserializeBinaryFromReader(message: ComplianceFlag, reader: jspb.BinaryReader): ComplianceFlag;
}

export namespace ComplianceFlag {
    export type AsObject = {
        flag: string,
        severity: string,
        description: string,
        value: string,
        threshold: string,
    }
}

export class GetComplianceStatusRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetComplianceStatusRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetComplianceStatusRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetComplianceStatusRequest): GetComplianceStatusRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetComplianceStatusRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetComplianceStatusRequest;
    static deserializeBinaryFromReader(message: GetComplianceStatusRequest, reader: jspb.BinaryReader): GetComplianceStatusRequest;
}

export namespace GetComplianceStatusRequest {
    export type AsObject = {
        userId: string,
    }
}

export class ComplianceStatusResponse extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ComplianceStatusResponse;

    getComplianceStatusMap(): jspb.Map<string, string>;
    clearComplianceStatusMap(): void;

    hasLastUpdated(): boolean;
    clearLastUpdated(): void;
    getLastUpdated(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastUpdated(value?: google_protobuf_timestamp_pb.Timestamp): ComplianceStatusResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComplianceStatusResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ComplianceStatusResponse): ComplianceStatusResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComplianceStatusResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComplianceStatusResponse;
    static deserializeBinaryFromReader(message: ComplianceStatusResponse, reader: jspb.BinaryReader): ComplianceStatusResponse;
}

export namespace ComplianceStatusResponse {
    export type AsObject = {
        userId: string,

        complianceStatusMap: Array<[string, string]>,
        lastUpdated?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class CreateRiskAlertRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateRiskAlertRequest;
    getAccountId(): string;
    setAccountId(value: string): CreateRiskAlertRequest;
    getTradeId(): string;
    setTradeId(value: string): CreateRiskAlertRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): CreateRiskAlertRequest;
    getAlertType(): AlertType;
    setAlertType(value: AlertType): CreateRiskAlertRequest;
    getSeverity(): AlertSeverity;
    setSeverity(value: AlertSeverity): CreateRiskAlertRequest;
    getPriority(): AlertPriority;
    setPriority(value: AlertPriority): CreateRiskAlertRequest;
    getTitle(): string;
    setTitle(value: string): CreateRiskAlertRequest;
    getDescription(): string;
    setDescription(value: string): CreateRiskAlertRequest;

    hasTriggerConditions(): boolean;
    clearTriggerConditions(): void;
    getTriggerConditions(): TriggerConditions | undefined;
    setTriggerConditions(value?: TriggerConditions): CreateRiskAlertRequest;
    getContextData(): string;
    setContextData(value: string): CreateRiskAlertRequest;
    clearRecommendedActionsList(): void;
    getRecommendedActionsList(): Array<string>;
    setRecommendedActionsList(value: Array<string>): CreateRiskAlertRequest;
    addRecommendedActions(value: string, index?: number): string;
    clearAutomaticActionsList(): void;
    getAutomaticActionsList(): Array<string>;
    setAutomaticActionsList(value: Array<string>): CreateRiskAlertRequest;
    addAutomaticActions(value: string, index?: number): string;

    hasImpactAssessment(): boolean;
    clearImpactAssessment(): void;
    getImpactAssessment(): ImpactAssessment | undefined;
    setImpactAssessment(value?: ImpactAssessment): CreateRiskAlertRequest;

    hasRelatedEntities(): boolean;
    clearRelatedEntities(): void;
    getRelatedEntities(): RelatedEntities | undefined;
    setRelatedEntities(value?: RelatedEntities): CreateRiskAlertRequest;
    clearNotificationChannelsList(): void;
    getNotificationChannelsList(): Array<string>;
    setNotificationChannelsList(value: Array<string>): CreateRiskAlertRequest;
    addNotificationChannels(value: string, index?: number): string;

    hasEscalationRules(): boolean;
    clearEscalationRules(): void;
    getEscalationRules(): EscalationRules | undefined;
    setEscalationRules(value?: EscalationRules): CreateRiskAlertRequest;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): CreateRiskAlertRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateRiskAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateRiskAlertRequest): CreateRiskAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateRiskAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateRiskAlertRequest;
    static deserializeBinaryFromReader(message: CreateRiskAlertRequest, reader: jspb.BinaryReader): CreateRiskAlertRequest;
}

export namespace CreateRiskAlertRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        tradeId: string,
        portfolioId: string,
        alertType: AlertType,
        severity: AlertSeverity,
        priority: AlertPriority,
        title: string,
        description: string,
        triggerConditions?: TriggerConditions.AsObject,
        contextData: string,
        recommendedActionsList: Array<string>,
        automaticActionsList: Array<string>,
        impactAssessment?: ImpactAssessment.AsObject,
        relatedEntities?: RelatedEntities.AsObject,
        notificationChannelsList: Array<string>,
        escalationRules?: EscalationRules.AsObject,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class TriggerConditions extends jspb.Message { 
    getRule(): string;
    setRule(value: string): TriggerConditions;
    getThreshold(): string;
    setThreshold(value: string): TriggerConditions;
    getActualValue(): string;
    setActualValue(value: string): TriggerConditions;
    getOperator(): string;
    setOperator(value: string): TriggerConditions;
    getTimeWindow(): string;
    setTimeWindow(value: string): TriggerConditions;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TriggerConditions.AsObject;
    static toObject(includeInstance: boolean, msg: TriggerConditions): TriggerConditions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TriggerConditions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TriggerConditions;
    static deserializeBinaryFromReader(message: TriggerConditions, reader: jspb.BinaryReader): TriggerConditions;
}

export namespace TriggerConditions {
    export type AsObject = {
        rule: string,
        threshold: string,
        actualValue: string,
        operator: string,
        timeWindow: string,
    }
}

export class ImpactAssessment extends jspb.Message { 
    getFinancialImpact(): number;
    setFinancialImpact(value: number): ImpactAssessment;
    getRiskExposure(): number;
    setRiskExposure(value: number): ImpactAssessment;
    getAffectedPositions(): number;
    setAffectedPositions(value: number): ImpactAssessment;
    getPotentialLoss(): number;
    setPotentialLoss(value: number): ImpactAssessment;
    getTimeToResolution(): string;
    setTimeToResolution(value: string): ImpactAssessment;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ImpactAssessment.AsObject;
    static toObject(includeInstance: boolean, msg: ImpactAssessment): ImpactAssessment.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ImpactAssessment, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ImpactAssessment;
    static deserializeBinaryFromReader(message: ImpactAssessment, reader: jspb.BinaryReader): ImpactAssessment;
}

export namespace ImpactAssessment {
    export type AsObject = {
        financialImpact: number,
        riskExposure: number,
        affectedPositions: number,
        potentialLoss: number,
        timeToResolution: string,
    }
}

export class RelatedEntities extends jspb.Message { 
    clearTradesList(): void;
    getTradesList(): Array<string>;
    setTradesList(value: Array<string>): RelatedEntities;
    addTrades(value: string, index?: number): string;
    clearPositionsList(): void;
    getPositionsList(): Array<string>;
    setPositionsList(value: Array<string>): RelatedEntities;
    addPositions(value: string, index?: number): string;
    clearAccountsList(): void;
    getAccountsList(): Array<string>;
    setAccountsList(value: Array<string>): RelatedEntities;
    addAccounts(value: string, index?: number): string;
    clearAlertsList(): void;
    getAlertsList(): Array<string>;
    setAlertsList(value: Array<string>): RelatedEntities;
    addAlerts(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RelatedEntities.AsObject;
    static toObject(includeInstance: boolean, msg: RelatedEntities): RelatedEntities.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RelatedEntities, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RelatedEntities;
    static deserializeBinaryFromReader(message: RelatedEntities, reader: jspb.BinaryReader): RelatedEntities;
}

export namespace RelatedEntities {
    export type AsObject = {
        tradesList: Array<string>,
        positionsList: Array<string>,
        accountsList: Array<string>,
        alertsList: Array<string>,
    }
}

export class EscalationRules extends jspb.Message { 
    getEscalateAfterMinutes(): number;
    setEscalateAfterMinutes(value: number): EscalationRules;
    clearEscalateToList(): void;
    getEscalateToList(): Array<string>;
    setEscalateToList(value: Array<string>): EscalationRules;
    addEscalateTo(value: string, index?: number): string;
    getEscalationSeverity(): AlertSeverity;
    setEscalationSeverity(value: AlertSeverity): EscalationRules;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EscalationRules.AsObject;
    static toObject(includeInstance: boolean, msg: EscalationRules): EscalationRules.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EscalationRules, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EscalationRules;
    static deserializeBinaryFromReader(message: EscalationRules, reader: jspb.BinaryReader): EscalationRules;
}

export namespace EscalationRules {
    export type AsObject = {
        escalateAfterMinutes: number,
        escalateToList: Array<string>,
        escalationSeverity: AlertSeverity,
    }
}

export class RiskAlertResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): RiskAlertResponse;
    getUserId(): string;
    setUserId(value: string): RiskAlertResponse;
    getAccountId(): string;
    setAccountId(value: string): RiskAlertResponse;
    getTradeId(): string;
    setTradeId(value: string): RiskAlertResponse;
    getPortfolioId(): string;
    setPortfolioId(value: string): RiskAlertResponse;
    getAlertType(): AlertType;
    setAlertType(value: AlertType): RiskAlertResponse;
    getSeverity(): AlertSeverity;
    setSeverity(value: AlertSeverity): RiskAlertResponse;
    getPriority(): AlertPriority;
    setPriority(value: AlertPriority): RiskAlertResponse;
    getStatus(): AlertStatus;
    setStatus(value: AlertStatus): RiskAlertResponse;
    getTitle(): string;
    setTitle(value: string): RiskAlertResponse;
    getDescription(): string;
    setDescription(value: string): RiskAlertResponse;

    hasTriggerConditions(): boolean;
    clearTriggerConditions(): void;
    getTriggerConditions(): TriggerConditions | undefined;
    setTriggerConditions(value?: TriggerConditions): RiskAlertResponse;
    getContextData(): string;
    setContextData(value: string): RiskAlertResponse;
    clearRecommendedActionsList(): void;
    getRecommendedActionsList(): Array<string>;
    setRecommendedActionsList(value: Array<string>): RiskAlertResponse;
    addRecommendedActions(value: string, index?: number): string;
    clearAutomaticActionsList(): void;
    getAutomaticActionsList(): Array<string>;
    setAutomaticActionsList(value: Array<string>): RiskAlertResponse;
    addAutomaticActions(value: string, index?: number): string;

    hasImpactAssessment(): boolean;
    clearImpactAssessment(): void;
    getImpactAssessment(): ImpactAssessment | undefined;
    setImpactAssessment(value?: ImpactAssessment): RiskAlertResponse;

    hasRelatedEntities(): boolean;
    clearRelatedEntities(): void;
    getRelatedEntities(): RelatedEntities | undefined;
    setRelatedEntities(value?: RelatedEntities): RiskAlertResponse;
    getAcknowledgedBy(): string;
    setAcknowledgedBy(value: string): RiskAlertResponse;

    hasAcknowledgedAt(): boolean;
    clearAcknowledgedAt(): void;
    getAcknowledgedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setAcknowledgedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;
    getAcknowledgmentComments(): string;
    setAcknowledgmentComments(value: string): RiskAlertResponse;
    getAssignedTo(): string;
    setAssignedTo(value: string): RiskAlertResponse;

    hasAssignedAt(): boolean;
    clearAssignedAt(): void;
    getAssignedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setAssignedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;
    getResolvedBy(): string;
    setResolvedBy(value: string): RiskAlertResponse;

    hasResolvedAt(): boolean;
    clearResolvedAt(): void;
    getResolvedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setResolvedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;
    getResolutionDetails(): string;
    setResolutionDetails(value: string): RiskAlertResponse;
    clearResolutionActionsList(): void;
    getResolutionActionsList(): Array<string>;
    setResolutionActionsList(value: Array<string>): RiskAlertResponse;
    addResolutionActions(value: string, index?: number): string;
    getIsEscalated(): boolean;
    setIsEscalated(value: boolean): RiskAlertResponse;

    hasEscalatedAt(): boolean;
    clearEscalatedAt(): void;
    getEscalatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEscalatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;

    hasEscalationRules(): boolean;
    clearEscalationRules(): void;
    getEscalationRules(): EscalationRules | undefined;
    setEscalationRules(value?: EscalationRules): RiskAlertResponse;
    clearNotificationChannelsList(): void;
    getNotificationChannelsList(): Array<string>;
    setNotificationChannelsList(value: Array<string>): RiskAlertResponse;
    addNotificationChannels(value: string, index?: number): string;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;
    getIsAutoGenerated(): boolean;
    setIsAutoGenerated(value: boolean): RiskAlertResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAlertResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RiskAlertResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RiskAlertResponse): RiskAlertResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RiskAlertResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RiskAlertResponse;
    static deserializeBinaryFromReader(message: RiskAlertResponse, reader: jspb.BinaryReader): RiskAlertResponse;
}

export namespace RiskAlertResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        tradeId: string,
        portfolioId: string,
        alertType: AlertType,
        severity: AlertSeverity,
        priority: AlertPriority,
        status: AlertStatus,
        title: string,
        description: string,
        triggerConditions?: TriggerConditions.AsObject,
        contextData: string,
        recommendedActionsList: Array<string>,
        automaticActionsList: Array<string>,
        impactAssessment?: ImpactAssessment.AsObject,
        relatedEntities?: RelatedEntities.AsObject,
        acknowledgedBy: string,
        acknowledgedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        acknowledgmentComments: string,
        assignedTo: string,
        assignedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        resolvedBy: string,
        resolvedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        resolutionDetails: string,
        resolutionActionsList: Array<string>,
        isEscalated: boolean,
        escalatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        escalationRules?: EscalationRules.AsObject,
        notificationChannelsList: Array<string>,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        isAutoGenerated: boolean,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class GetActiveAlertsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetActiveAlertsRequest;
    getAccountId(): string;
    setAccountId(value: string): GetActiveAlertsRequest;
    getAlertType(): AlertType;
    setAlertType(value: AlertType): GetActiveAlertsRequest;
    getSeverity(): AlertSeverity;
    setSeverity(value: AlertSeverity): GetActiveAlertsRequest;
    getPriority(): AlertPriority;
    setPriority(value: AlertPriority): GetActiveAlertsRequest;
    getLimit(): number;
    setLimit(value: number): GetActiveAlertsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetActiveAlertsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetActiveAlertsRequest): GetActiveAlertsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetActiveAlertsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetActiveAlertsRequest;
    static deserializeBinaryFromReader(message: GetActiveAlertsRequest, reader: jspb.BinaryReader): GetActiveAlertsRequest;
}

export namespace GetActiveAlertsRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        alertType: AlertType,
        severity: AlertSeverity,
        priority: AlertPriority,
        limit: number,
    }
}

export class ListRiskAlertsResponse extends jspb.Message { 
    clearAlertsList(): void;
    getAlertsList(): Array<RiskAlertResponse>;
    setAlertsList(value: Array<RiskAlertResponse>): ListRiskAlertsResponse;
    addAlerts(value?: RiskAlertResponse, index?: number): RiskAlertResponse;
    getTotal(): number;
    setTotal(value: number): ListRiskAlertsResponse;
    getPage(): number;
    setPage(value: number): ListRiskAlertsResponse;
    getLimit(): number;
    setLimit(value: number): ListRiskAlertsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListRiskAlertsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskAlertsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskAlertsResponse): ListRiskAlertsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskAlertsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskAlertsResponse;
    static deserializeBinaryFromReader(message: ListRiskAlertsResponse, reader: jspb.BinaryReader): ListRiskAlertsResponse;
}

export namespace ListRiskAlertsResponse {
    export type AsObject = {
        alertsList: Array<RiskAlertResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class AcknowledgeAlertRequest extends jspb.Message { 
    getAlertId(): string;
    setAlertId(value: string): AcknowledgeAlertRequest;
    getAcknowledgedBy(): string;
    setAcknowledgedBy(value: string): AcknowledgeAlertRequest;
    getComments(): string;
    setComments(value: string): AcknowledgeAlertRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AcknowledgeAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AcknowledgeAlertRequest): AcknowledgeAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AcknowledgeAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AcknowledgeAlertRequest;
    static deserializeBinaryFromReader(message: AcknowledgeAlertRequest, reader: jspb.BinaryReader): AcknowledgeAlertRequest;
}

export namespace AcknowledgeAlertRequest {
    export type AsObject = {
        alertId: string,
        acknowledgedBy: string,
        comments: string,
    }
}

export class ResolveAlertRequest extends jspb.Message { 
    getAlertId(): string;
    setAlertId(value: string): ResolveAlertRequest;
    getResolvedBy(): string;
    setResolvedBy(value: string): ResolveAlertRequest;
    getResolutionDetails(): string;
    setResolutionDetails(value: string): ResolveAlertRequest;
    clearResolutionActionsList(): void;
    getResolutionActionsList(): Array<string>;
    setResolutionActionsList(value: Array<string>): ResolveAlertRequest;
    addResolutionActions(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ResolveAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ResolveAlertRequest): ResolveAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ResolveAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ResolveAlertRequest;
    static deserializeBinaryFromReader(message: ResolveAlertRequest, reader: jspb.BinaryReader): ResolveAlertRequest;
}

export namespace ResolveAlertRequest {
    export type AsObject = {
        alertId: string,
        resolvedBy: string,
        resolutionDetails: string,
        resolutionActionsList: Array<string>,
    }
}

export class CreateRiskLimitRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateRiskLimitRequest;
    getAccountId(): string;
    setAccountId(value: string): CreateRiskLimitRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): CreateRiskLimitRequest;
    getLimitType(): LimitType;
    setLimitType(value: LimitType): CreateRiskLimitRequest;
    getScope(): LimitScope;
    setScope(value: LimitScope): CreateRiskLimitRequest;
    getName(): string;
    setName(value: string): CreateRiskLimitRequest;
    getDescription(): string;
    setDescription(value: string): CreateRiskLimitRequest;
    getLimitValue(): number;
    setLimitValue(value: number): CreateRiskLimitRequest;
    getWarningThreshold(): number;
    setWarningThreshold(value: number): CreateRiskLimitRequest;
    getStatus(): LimitStatus;
    setStatus(value: LimitStatus): CreateRiskLimitRequest;
    getFrequency(): LimitFrequency;
    setFrequency(value: LimitFrequency): CreateRiskLimitRequest;
    getLimitConfig(): string;
    setLimitConfig(value: string): CreateRiskLimitRequest;
    getBreachActions(): string;
    setBreachActions(value: string): CreateRiskLimitRequest;

    hasEffectiveFrom(): boolean;
    clearEffectiveFrom(): void;
    getEffectiveFrom(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEffectiveFrom(value?: google_protobuf_timestamp_pb.Timestamp): CreateRiskLimitRequest;

    hasEffectiveTo(): boolean;
    clearEffectiveTo(): void;
    getEffectiveTo(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEffectiveTo(value?: google_protobuf_timestamp_pb.Timestamp): CreateRiskLimitRequest;
    getCreatedBy(): string;
    setCreatedBy(value: string): CreateRiskLimitRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateRiskLimitRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateRiskLimitRequest): CreateRiskLimitRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateRiskLimitRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateRiskLimitRequest;
    static deserializeBinaryFromReader(message: CreateRiskLimitRequest, reader: jspb.BinaryReader): CreateRiskLimitRequest;
}

export namespace CreateRiskLimitRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        limitType: LimitType,
        scope: LimitScope,
        name: string,
        description: string,
        limitValue: number,
        warningThreshold: number,
        status: LimitStatus,
        frequency: LimitFrequency,
        limitConfig: string,
        breachActions: string,
        effectiveFrom?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        effectiveTo?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdBy: string,
    }
}

export class RiskLimitResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): RiskLimitResponse;
    getUserId(): string;
    setUserId(value: string): RiskLimitResponse;
    getAccountId(): string;
    setAccountId(value: string): RiskLimitResponse;
    getPortfolioId(): string;
    setPortfolioId(value: string): RiskLimitResponse;
    getLimitType(): LimitType;
    setLimitType(value: LimitType): RiskLimitResponse;
    getScope(): LimitScope;
    setScope(value: LimitScope): RiskLimitResponse;
    getName(): string;
    setName(value: string): RiskLimitResponse;
    getDescription(): string;
    setDescription(value: string): RiskLimitResponse;
    getLimitValue(): number;
    setLimitValue(value: number): RiskLimitResponse;
    getWarningThreshold(): number;
    setWarningThreshold(value: number): RiskLimitResponse;
    getCurrentUtilization(): number;
    setCurrentUtilization(value: number): RiskLimitResponse;
    getUtilizationPercentage(): number;
    setUtilizationPercentage(value: number): RiskLimitResponse;
    getPeakUtilization(): number;
    setPeakUtilization(value: number): RiskLimitResponse;

    hasPeakUtilizationAt(): boolean;
    clearPeakUtilizationAt(): void;
    getPeakUtilizationAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setPeakUtilizationAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;
    getStatus(): LimitStatus;
    setStatus(value: LimitStatus): RiskLimitResponse;
    getFrequency(): LimitFrequency;
    setFrequency(value: LimitFrequency): RiskLimitResponse;
    getLimitConfig(): string;
    setLimitConfig(value: string): RiskLimitResponse;
    getBreachActions(): string;
    setBreachActions(value: string): RiskLimitResponse;

    hasEffectiveFrom(): boolean;
    clearEffectiveFrom(): void;
    getEffectiveFrom(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEffectiveFrom(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;

    hasEffectiveTo(): boolean;
    clearEffectiveTo(): void;
    getEffectiveTo(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEffectiveTo(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;

    hasLastCheckedAt(): boolean;
    clearLastCheckedAt(): void;
    getLastCheckedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastCheckedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;

    hasNextCheckAt(): boolean;
    clearNextCheckAt(): void;
    getNextCheckAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setNextCheckAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;
    getCreatedBy(): string;
    setCreatedBy(value: string): RiskLimitResponse;
    getModifiedBy(): string;
    setModifiedBy(value: string): RiskLimitResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskLimitResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RiskLimitResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RiskLimitResponse): RiskLimitResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RiskLimitResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RiskLimitResponse;
    static deserializeBinaryFromReader(message: RiskLimitResponse, reader: jspb.BinaryReader): RiskLimitResponse;
}

export namespace RiskLimitResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        portfolioId: string,
        limitType: LimitType,
        scope: LimitScope,
        name: string,
        description: string,
        limitValue: number,
        warningThreshold: number,
        currentUtilization: number,
        utilizationPercentage: number,
        peakUtilization: number,
        peakUtilizationAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        status: LimitStatus,
        frequency: LimitFrequency,
        limitConfig: string,
        breachActions: string,
        effectiveFrom?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        effectiveTo?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        lastCheckedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        nextCheckAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        createdBy: string,
        modifiedBy: string,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class UpdateRiskLimitRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): UpdateRiskLimitRequest;
    getLimitValue(): number;
    setLimitValue(value: number): UpdateRiskLimitRequest;
    getWarningThreshold(): number;
    setWarningThreshold(value: number): UpdateRiskLimitRequest;
    getStatus(): LimitStatus;
    setStatus(value: LimitStatus): UpdateRiskLimitRequest;
    getDescription(): string;
    setDescription(value: string): UpdateRiskLimitRequest;
    getLimitConfig(): string;
    setLimitConfig(value: string): UpdateRiskLimitRequest;
    getBreachActions(): string;
    setBreachActions(value: string): UpdateRiskLimitRequest;

    hasEffectiveTo(): boolean;
    clearEffectiveTo(): void;
    getEffectiveTo(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setEffectiveTo(value?: google_protobuf_timestamp_pb.Timestamp): UpdateRiskLimitRequest;
    getModifiedBy(): string;
    setModifiedBy(value: string): UpdateRiskLimitRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateRiskLimitRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateRiskLimitRequest): UpdateRiskLimitRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateRiskLimitRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateRiskLimitRequest;
    static deserializeBinaryFromReader(message: UpdateRiskLimitRequest, reader: jspb.BinaryReader): UpdateRiskLimitRequest;
}

export namespace UpdateRiskLimitRequest {
    export type AsObject = {
        id: string,
        limitValue: number,
        warningThreshold: number,
        status: LimitStatus,
        description: string,
        limitConfig: string,
        breachActions: string,
        effectiveTo?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        modifiedBy: string,
    }
}

export class GetRiskLimitsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetRiskLimitsRequest;
    getAccountId(): string;
    setAccountId(value: string): GetRiskLimitsRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): GetRiskLimitsRequest;
    getLimitType(): LimitType;
    setLimitType(value: LimitType): GetRiskLimitsRequest;
    getScope(): LimitScope;
    setScope(value: LimitScope): GetRiskLimitsRequest;
    getStatus(): LimitStatus;
    setStatus(value: LimitStatus): GetRiskLimitsRequest;
    getPage(): number;
    setPage(value: number): GetRiskLimitsRequest;
    getLimit(): number;
    setLimit(value: number): GetRiskLimitsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRiskLimitsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRiskLimitsRequest): GetRiskLimitsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRiskLimitsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRiskLimitsRequest;
    static deserializeBinaryFromReader(message: GetRiskLimitsRequest, reader: jspb.BinaryReader): GetRiskLimitsRequest;
}

export namespace GetRiskLimitsRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        limitType: LimitType,
        scope: LimitScope,
        status: LimitStatus,
        page: number,
        limit: number,
    }
}

export class ListRiskLimitsResponse extends jspb.Message { 
    clearLimitsList(): void;
    getLimitsList(): Array<RiskLimitResponse>;
    setLimitsList(value: Array<RiskLimitResponse>): ListRiskLimitsResponse;
    addLimits(value?: RiskLimitResponse, index?: number): RiskLimitResponse;
    getTotal(): number;
    setTotal(value: number): ListRiskLimitsResponse;
    getPage(): number;
    setPage(value: number): ListRiskLimitsResponse;
    getLimit(): number;
    setLimit(value: number): ListRiskLimitsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListRiskLimitsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskLimitsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskLimitsResponse): ListRiskLimitsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskLimitsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskLimitsResponse;
    static deserializeBinaryFromReader(message: ListRiskLimitsResponse, reader: jspb.BinaryReader): ListRiskLimitsResponse;
}

export namespace ListRiskLimitsResponse {
    export type AsObject = {
        limitsList: Array<RiskLimitResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class CheckLimitBreachRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CheckLimitBreachRequest;
    getAccountId(): string;
    setAccountId(value: string): CheckLimitBreachRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): CheckLimitBreachRequest;
    getLimitType(): LimitType;
    setLimitType(value: LimitType): CheckLimitBreachRequest;
    getCurrentValue(): number;
    setCurrentValue(value: number): CheckLimitBreachRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CheckLimitBreachRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CheckLimitBreachRequest): CheckLimitBreachRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CheckLimitBreachRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CheckLimitBreachRequest;
    static deserializeBinaryFromReader(message: CheckLimitBreachRequest, reader: jspb.BinaryReader): CheckLimitBreachRequest;
}

export namespace CheckLimitBreachRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        limitType: LimitType,
        currentValue: number,
    }
}

export class LimitBreachResponse extends jspb.Message { 
    getBreachDetected(): boolean;
    setBreachDetected(value: boolean): LimitBreachResponse;
    clearBreachedLimitsList(): void;
    getBreachedLimitsList(): Array<RiskLimitResponse>;
    setBreachedLimitsList(value: Array<RiskLimitResponse>): LimitBreachResponse;
    addBreachedLimits(value?: RiskLimitResponse, index?: number): RiskLimitResponse;
    clearWarningLimitsList(): void;
    getWarningLimitsList(): Array<RiskLimitResponse>;
    setWarningLimitsList(value: Array<RiskLimitResponse>): LimitBreachResponse;
    addWarningLimits(value?: RiskLimitResponse, index?: number): RiskLimitResponse;
    clearRecommendedActionsList(): void;
    getRecommendedActionsList(): Array<string>;
    setRecommendedActionsList(value: Array<string>): LimitBreachResponse;
    addRecommendedActions(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LimitBreachResponse.AsObject;
    static toObject(includeInstance: boolean, msg: LimitBreachResponse): LimitBreachResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LimitBreachResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LimitBreachResponse;
    static deserializeBinaryFromReader(message: LimitBreachResponse, reader: jspb.BinaryReader): LimitBreachResponse;
}

export namespace LimitBreachResponse {
    export type AsObject = {
        breachDetected: boolean,
        breachedLimitsList: Array<RiskLimitResponse.AsObject>,
        warningLimitsList: Array<RiskLimitResponse.AsObject>,
        recommendedActionsList: Array<string>,
    }
}

export class DetectFraudRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): DetectFraudRequest;
    getAccountId(): string;
    setAccountId(value: string): DetectFraudRequest;

    hasSessionData(): boolean;
    clearSessionData(): void;
    getSessionData(): SessionData | undefined;
    setSessionData(value?: SessionData): DetectFraudRequest;

    hasTransactionData(): boolean;
    clearTransactionData(): void;
    getTransactionData(): TransactionDataForFraud | undefined;
    setTransactionData(value?: TransactionDataForFraud): DetectFraudRequest;

    hasTradingActivity(): boolean;
    clearTradingActivity(): void;
    getTradingActivity(): TradingActivity | undefined;
    setTradingActivity(value?: TradingActivity): DetectFraudRequest;

    hasUserProfile(): boolean;
    clearUserProfile(): void;
    getUserProfile(): UserProfileForFraud | undefined;
    setUserProfile(value?: UserProfileForFraud): DetectFraudRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DetectFraudRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DetectFraudRequest): DetectFraudRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DetectFraudRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DetectFraudRequest;
    static deserializeBinaryFromReader(message: DetectFraudRequest, reader: jspb.BinaryReader): DetectFraudRequest;
}

export namespace DetectFraudRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        sessionData?: SessionData.AsObject,
        transactionData?: TransactionDataForFraud.AsObject,
        tradingActivity?: TradingActivity.AsObject,
        userProfile?: UserProfileForFraud.AsObject,
    }
}

export class SessionData extends jspb.Message { 
    getIpAddress(): string;
    setIpAddress(value: string): SessionData;
    getUserAgent(): string;
    setUserAgent(value: string): SessionData;
    getDeviceFingerprint(): string;
    setDeviceFingerprint(value: string): SessionData;

    hasLocation(): boolean;
    clearLocation(): void;
    getLocation(): Location | undefined;
    setLocation(value?: Location): SessionData;
    getSessionDuration(): number;
    setSessionDuration(value: number): SessionData;

    hasLoginTime(): boolean;
    clearLoginTime(): void;
    getLoginTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLoginTime(value?: google_protobuf_timestamp_pb.Timestamp): SessionData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SessionData.AsObject;
    static toObject(includeInstance: boolean, msg: SessionData): SessionData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SessionData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SessionData;
    static deserializeBinaryFromReader(message: SessionData, reader: jspb.BinaryReader): SessionData;
}

export namespace SessionData {
    export type AsObject = {
        ipAddress: string,
        userAgent: string,
        deviceFingerprint: string,
        location?: Location.AsObject,
        sessionDuration: number,
        loginTime?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class Location extends jspb.Message { 
    getCountry(): string;
    setCountry(value: string): Location;
    getCity(): string;
    setCity(value: string): Location;

    hasCoordinates(): boolean;
    clearCoordinates(): void;
    getCoordinates(): Coordinates | undefined;
    setCoordinates(value?: Coordinates): Location;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Location.AsObject;
    static toObject(includeInstance: boolean, msg: Location): Location.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Location, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Location;
    static deserializeBinaryFromReader(message: Location, reader: jspb.BinaryReader): Location;
}

export namespace Location {
    export type AsObject = {
        country: string,
        city: string,
        coordinates?: Coordinates.AsObject,
    }
}

export class Coordinates extends jspb.Message { 
    getLatitude(): number;
    setLatitude(value: number): Coordinates;
    getLongitude(): number;
    setLongitude(value: number): Coordinates;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Coordinates.AsObject;
    static toObject(includeInstance: boolean, msg: Coordinates): Coordinates.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Coordinates, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Coordinates;
    static deserializeBinaryFromReader(message: Coordinates, reader: jspb.BinaryReader): Coordinates;
}

export namespace Coordinates {
    export type AsObject = {
        latitude: number,
        longitude: number,
    }
}

export class TransactionDataForFraud extends jspb.Message { 
    getAmount(): number;
    setAmount(value: number): TransactionDataForFraud;
    getCurrency(): string;
    setCurrency(value: string): TransactionDataForFraud;
    getRecipient(): string;
    setRecipient(value: string): TransactionDataForFraud;
    getDescription(): string;
    setDescription(value: string): TransactionDataForFraud;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): TransactionDataForFraud;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TransactionDataForFraud.AsObject;
    static toObject(includeInstance: boolean, msg: TransactionDataForFraud): TransactionDataForFraud.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TransactionDataForFraud, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TransactionDataForFraud;
    static deserializeBinaryFromReader(message: TransactionDataForFraud, reader: jspb.BinaryReader): TransactionDataForFraud;
}

export namespace TransactionDataForFraud {
    export type AsObject = {
        amount: number,
        currency: string,
        recipient: string,
        description: string,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class TradingActivity extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): TradingActivity;
    getSide(): TradeSide;
    setSide(value: TradeSide): TradingActivity;
    getQuantity(): number;
    setQuantity(value: number): TradingActivity;
    getPrice(): number;
    setPrice(value: number): TradingActivity;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): TradingActivity;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TradingActivity.AsObject;
    static toObject(includeInstance: boolean, msg: TradingActivity): TradingActivity.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TradingActivity, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TradingActivity;
    static deserializeBinaryFromReader(message: TradingActivity, reader: jspb.BinaryReader): TradingActivity;
}

export namespace TradingActivity {
    export type AsObject = {
        symbol: string,
        side: TradeSide,
        quantity: number,
        price: number,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class UserProfileForFraud extends jspb.Message { 

    hasRegistrationDate(): boolean;
    clearRegistrationDate(): void;
    getRegistrationDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setRegistrationDate(value?: google_protobuf_timestamp_pb.Timestamp): UserProfileForFraud;

    hasLastLoginDate(): boolean;
    clearLastLoginDate(): void;
    getLastLoginDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastLoginDate(value?: google_protobuf_timestamp_pb.Timestamp): UserProfileForFraud;
    clearTypicalLoginTimesList(): void;
    getTypicalLoginTimesList(): Array<number>;
    setTypicalLoginTimesList(value: Array<number>): UserProfileForFraud;
    addTypicalLoginTimes(value: number, index?: number): number;
    clearTypicalLocationsList(): void;
    getTypicalLocationsList(): Array<TypicalLocation>;
    setTypicalLocationsList(value: Array<TypicalLocation>): UserProfileForFraud;
    addTypicalLocations(value?: TypicalLocation, index?: number): TypicalLocation;
    getAverageSessionDuration(): number;
    setAverageSessionDuration(value: number): UserProfileForFraud;
    clearDeviceHistoryList(): void;
    getDeviceHistoryList(): Array<DeviceHistory>;
    setDeviceHistoryList(value: Array<DeviceHistory>): UserProfileForFraud;
    addDeviceHistory(value?: DeviceHistory, index?: number): DeviceHistory;
    getRiskScore(): number;
    setRiskScore(value: number): UserProfileForFraud;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserProfileForFraud.AsObject;
    static toObject(includeInstance: boolean, msg: UserProfileForFraud): UserProfileForFraud.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserProfileForFraud, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserProfileForFraud;
    static deserializeBinaryFromReader(message: UserProfileForFraud, reader: jspb.BinaryReader): UserProfileForFraud;
}

export namespace UserProfileForFraud {
    export type AsObject = {
        registrationDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        lastLoginDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        typicalLoginTimesList: Array<number>,
        typicalLocationsList: Array<TypicalLocation.AsObject>,
        averageSessionDuration: number,
        deviceHistoryList: Array<DeviceHistory.AsObject>,
        riskScore: number,
    }
}

export class TypicalLocation extends jspb.Message { 
    getCountry(): string;
    setCountry(value: string): TypicalLocation;
    getCity(): string;
    setCity(value: string): TypicalLocation;
    getFrequency(): number;
    setFrequency(value: number): TypicalLocation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TypicalLocation.AsObject;
    static toObject(includeInstance: boolean, msg: TypicalLocation): TypicalLocation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TypicalLocation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TypicalLocation;
    static deserializeBinaryFromReader(message: TypicalLocation, reader: jspb.BinaryReader): TypicalLocation;
}

export namespace TypicalLocation {
    export type AsObject = {
        country: string,
        city: string,
        frequency: number,
    }
}

export class DeviceHistory extends jspb.Message { 
    getDeviceFingerprint(): string;
    setDeviceFingerprint(value: string): DeviceHistory;

    hasLastUsed(): boolean;
    clearLastUsed(): void;
    getLastUsed(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastUsed(value?: google_protobuf_timestamp_pb.Timestamp): DeviceHistory;
    getTrusted(): boolean;
    setTrusted(value: boolean): DeviceHistory;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeviceHistory.AsObject;
    static toObject(includeInstance: boolean, msg: DeviceHistory): DeviceHistory.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeviceHistory, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeviceHistory;
    static deserializeBinaryFromReader(message: DeviceHistory, reader: jspb.BinaryReader): DeviceHistory;
}

export namespace DeviceHistory {
    export type AsObject = {
        deviceFingerprint: string,
        lastUsed?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        trusted: boolean,
    }
}

export class FraudDetectionResponse extends jspb.Message { 
    getOverallScore(): number;
    setOverallScore(value: number): FraudDetectionResponse;

    hasCategories(): boolean;
    clearCategories(): void;
    getCategories(): FraudCategories | undefined;
    setCategories(value?: FraudCategories): FraudDetectionResponse;
    clearRiskFactorsList(): void;
    getRiskFactorsList(): Array<FraudRiskFactor>;
    setRiskFactorsList(value: Array<FraudRiskFactor>): FraudDetectionResponse;
    addRiskFactors(value?: FraudRiskFactor, index?: number): FraudRiskFactor;
    getRecommendation(): FraudRecommendation;
    setRecommendation(value: FraudRecommendation): FraudDetectionResponse;
    getConfidence(): number;
    setConfidence(value: number): FraudDetectionResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FraudDetectionResponse.AsObject;
    static toObject(includeInstance: boolean, msg: FraudDetectionResponse): FraudDetectionResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FraudDetectionResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FraudDetectionResponse;
    static deserializeBinaryFromReader(message: FraudDetectionResponse, reader: jspb.BinaryReader): FraudDetectionResponse;
}

export namespace FraudDetectionResponse {
    export type AsObject = {
        overallScore: number,
        categories?: FraudCategories.AsObject,
        riskFactorsList: Array<FraudRiskFactor.AsObject>,
        recommendation: FraudRecommendation,
        confidence: number,
    }
}

export class FraudCategories extends jspb.Message { 
    getLocation(): number;
    setLocation(value: number): FraudCategories;
    getDevice(): number;
    setDevice(value: number): FraudCategories;
    getBehavioral(): number;
    setBehavioral(value: number): FraudCategories;
    getTransaction(): number;
    setTransaction(value: number): FraudCategories;
    getTemporal(): number;
    setTemporal(value: number): FraudCategories;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FraudCategories.AsObject;
    static toObject(includeInstance: boolean, msg: FraudCategories): FraudCategories.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FraudCategories, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FraudCategories;
    static deserializeBinaryFromReader(message: FraudCategories, reader: jspb.BinaryReader): FraudCategories;
}

export namespace FraudCategories {
    export type AsObject = {
        location: number,
        device: number,
        behavioral: number,
        transaction: number,
        temporal: number,
    }
}

export class FraudRiskFactor extends jspb.Message { 
    getCategory(): string;
    setCategory(value: string): FraudRiskFactor;
    getFactor(): string;
    setFactor(value: string): FraudRiskFactor;
    getScore(): number;
    setScore(value: number): FraudRiskFactor;
    getWeight(): number;
    setWeight(value: number): FraudRiskFactor;
    getDescription(): string;
    setDescription(value: string): FraudRiskFactor;
    getSeverity(): FraudSeverity;
    setSeverity(value: FraudSeverity): FraudRiskFactor;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FraudRiskFactor.AsObject;
    static toObject(includeInstance: boolean, msg: FraudRiskFactor): FraudRiskFactor.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FraudRiskFactor, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FraudRiskFactor;
    static deserializeBinaryFromReader(message: FraudRiskFactor, reader: jspb.BinaryReader): FraudRiskFactor;
}

export namespace FraudRiskFactor {
    export type AsObject = {
        category: string,
        factor: string,
        score: number,
        weight: number,
        description: string,
        severity: FraudSeverity,
    }
}

export class GetFraudScoreRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetFraudScoreRequest;
    getDays(): number;
    setDays(value: number): GetFraudScoreRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetFraudScoreRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetFraudScoreRequest): GetFraudScoreRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetFraudScoreRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetFraudScoreRequest;
    static deserializeBinaryFromReader(message: GetFraudScoreRequest, reader: jspb.BinaryReader): GetFraudScoreRequest;
}

export namespace GetFraudScoreRequest {
    export type AsObject = {
        userId: string,
        days: number,
    }
}

export class FraudScoreResponse extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): FraudScoreResponse;
    getCurrentRiskScore(): number;
    setCurrentRiskScore(value: number): FraudScoreResponse;
    getRiskTrend(): FraudTrend;
    setRiskTrend(value: FraudTrend): FraudScoreResponse;

    hasLastFraudCheck(): boolean;
    clearLastFraudCheck(): void;
    getLastFraudCheck(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setLastFraudCheck(value?: google_protobuf_timestamp_pb.Timestamp): FraudScoreResponse;
    getTrustedDevices(): number;
    setTrustedDevices(value: number): FraudScoreResponse;
    getTypicalLocations(): number;
    setTypicalLocations(value: number): FraudScoreResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FraudScoreResponse.AsObject;
    static toObject(includeInstance: boolean, msg: FraudScoreResponse): FraudScoreResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FraudScoreResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FraudScoreResponse;
    static deserializeBinaryFromReader(message: FraudScoreResponse, reader: jspb.BinaryReader): FraudScoreResponse;
}

export namespace FraudScoreResponse {
    export type AsObject = {
        userId: string,
        currentRiskScore: number,
        riskTrend: FraudTrend,
        lastFraudCheck?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        trustedDevices: number,
        typicalLocations: number,
    }
}

export class GetRiskMetricsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetRiskMetricsRequest;
    getAccountId(): string;
    setAccountId(value: string): GetRiskMetricsRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): GetRiskMetricsRequest;
    getPositionId(): string;
    setPositionId(value: string): GetRiskMetricsRequest;
    getMetricType(): MetricType;
    setMetricType(value: MetricType): GetRiskMetricsRequest;
    getScope(): MetricScope;
    setScope(value: MetricScope): GetRiskMetricsRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): GetRiskMetricsRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): GetRiskMetricsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRiskMetricsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRiskMetricsRequest): GetRiskMetricsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRiskMetricsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRiskMetricsRequest;
    static deserializeBinaryFromReader(message: GetRiskMetricsRequest, reader: jspb.BinaryReader): GetRiskMetricsRequest;
}

export namespace GetRiskMetricsRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        positionId: string,
        metricType: MetricType,
        scope: MetricScope,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class RiskMetricsResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): RiskMetricsResponse;
    getUserId(): string;
    setUserId(value: string): RiskMetricsResponse;
    getAccountId(): string;
    setAccountId(value: string): RiskMetricsResponse;
    getPortfolioId(): string;
    setPortfolioId(value: string): RiskMetricsResponse;
    getPositionId(): string;
    setPositionId(value: string): RiskMetricsResponse;
    getMetricType(): MetricType;
    setMetricType(value: MetricType): RiskMetricsResponse;
    getScope(): MetricScope;
    setScope(value: MetricScope): RiskMetricsResponse;
    getFrequency(): MetricFrequency;
    setFrequency(value: MetricFrequency): RiskMetricsResponse;
    getMetricValue(): number;
    setMetricValue(value: number): RiskMetricsResponse;

    hasTimestamp(): boolean;
    clearTimestamp(): void;
    getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): RiskMetricsResponse;
    getConfidenceLevel(): number;
    setConfidenceLevel(value: number): RiskMetricsResponse;
    getTimeHorizon(): number;
    setTimeHorizon(value: number): RiskMetricsResponse;
    getLookbackPeriod(): number;
    setLookbackPeriod(value: number): RiskMetricsResponse;
    getMetricDetails(): string;
    setMetricDetails(value: string): RiskMetricsResponse;
    getTrendData(): string;
    setTrendData(value: string): RiskMetricsResponse;
    getRiskAttribution(): string;
    setRiskAttribution(value: string): RiskMetricsResponse;
    getStressTestResults(): string;
    setStressTestResults(value: string): RiskMetricsResponse;
    getModelParameters(): string;
    setModelParameters(value: string): RiskMetricsResponse;
    getDataQuality(): string;
    setDataQuality(value: string): RiskMetricsResponse;
    getBenchmarks(): string;
    setBenchmarks(value: string): RiskMetricsResponse;
    clearAssociatedLimitsList(): void;
    getAssociatedLimitsList(): Array<string>;
    setAssociatedLimitsList(value: Array<string>): RiskMetricsResponse;
    addAssociatedLimits(value: string, index?: number): string;
    getWarnings(): string;
    setWarnings(value: string): RiskMetricsResponse;
    getPerformanceMetrics(): string;
    setPerformanceMetrics(value: string): RiskMetricsResponse;

    hasNextCalculationAt(): boolean;
    clearNextCalculationAt(): void;
    getNextCalculationAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setNextCalculationAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskMetricsResponse;
    getIsStale(): boolean;
    setIsStale(value: boolean): RiskMetricsResponse;
    getStaleThresholdMinutes(): number;
    setStaleThresholdMinutes(value: number): RiskMetricsResponse;
    getMetadata(): string;
    setMetadata(value: string): RiskMetricsResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskMetricsResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskMetricsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RiskMetricsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RiskMetricsResponse): RiskMetricsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RiskMetricsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RiskMetricsResponse;
    static deserializeBinaryFromReader(message: RiskMetricsResponse, reader: jspb.BinaryReader): RiskMetricsResponse;
}

export namespace RiskMetricsResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        portfolioId: string,
        positionId: string,
        metricType: MetricType,
        scope: MetricScope,
        frequency: MetricFrequency,
        metricValue: number,
        timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        confidenceLevel: number,
        timeHorizon: number,
        lookbackPeriod: number,
        metricDetails: string,
        trendData: string,
        riskAttribution: string,
        stressTestResults: string,
        modelParameters: string,
        dataQuality: string,
        benchmarks: string,
        associatedLimitsList: Array<string>,
        warnings: string,
        performanceMetrics: string,
        nextCalculationAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        isStale: boolean,
        staleThresholdMinutes: number,
        metadata: string,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ListRiskMetricsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListRiskMetricsRequest;
    getAccountId(): string;
    setAccountId(value: string): ListRiskMetricsRequest;
    getPortfolioId(): string;
    setPortfolioId(value: string): ListRiskMetricsRequest;
    getMetricType(): MetricType;
    setMetricType(value: MetricType): ListRiskMetricsRequest;
    getScope(): MetricScope;
    setScope(value: MetricScope): ListRiskMetricsRequest;
    getFrequency(): MetricFrequency;
    setFrequency(value: MetricFrequency): ListRiskMetricsRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): ListRiskMetricsRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): ListRiskMetricsRequest;
    getPage(): number;
    setPage(value: number): ListRiskMetricsRequest;
    getLimit(): number;
    setLimit(value: number): ListRiskMetricsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskMetricsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskMetricsRequest): ListRiskMetricsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskMetricsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskMetricsRequest;
    static deserializeBinaryFromReader(message: ListRiskMetricsRequest, reader: jspb.BinaryReader): ListRiskMetricsRequest;
}

export namespace ListRiskMetricsRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        portfolioId: string,
        metricType: MetricType,
        scope: MetricScope,
        frequency: MetricFrequency,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        page: number,
        limit: number,
    }
}

export class ListRiskMetricsResponse extends jspb.Message { 
    clearMetricsList(): void;
    getMetricsList(): Array<RiskMetricsResponse>;
    setMetricsList(value: Array<RiskMetricsResponse>): ListRiskMetricsResponse;
    addMetrics(value?: RiskMetricsResponse, index?: number): RiskMetricsResponse;
    getTotal(): number;
    setTotal(value: number): ListRiskMetricsResponse;
    getPage(): number;
    setPage(value: number): ListRiskMetricsResponse;
    getLimit(): number;
    setLimit(value: number): ListRiskMetricsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListRiskMetricsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskMetricsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskMetricsResponse): ListRiskMetricsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskMetricsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskMetricsResponse;
    static deserializeBinaryFromReader(message: ListRiskMetricsResponse, reader: jspb.BinaryReader): ListRiskMetricsResponse;
}

export namespace ListRiskMetricsResponse {
    export type AsObject = {
        metricsList: Array<RiskMetricsResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class GetRiskAssessmentRequest extends jspb.Message { 
    getId(): string;
    setId(value: string): GetRiskAssessmentRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRiskAssessmentRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRiskAssessmentRequest): GetRiskAssessmentRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRiskAssessmentRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRiskAssessmentRequest;
    static deserializeBinaryFromReader(message: GetRiskAssessmentRequest, reader: jspb.BinaryReader): GetRiskAssessmentRequest;
}

export namespace GetRiskAssessmentRequest {
    export type AsObject = {
        id: string,
    }
}

export class RiskAssessmentResponse extends jspb.Message { 
    getId(): string;
    setId(value: string): RiskAssessmentResponse;
    getUserId(): string;
    setUserId(value: string): RiskAssessmentResponse;
    getAccountId(): string;
    setAccountId(value: string): RiskAssessmentResponse;
    getTradeId(): string;
    setTradeId(value: string): RiskAssessmentResponse;
    getPortfolioId(): string;
    setPortfolioId(value: string): RiskAssessmentResponse;
    getAssessmentType(): AssessmentType;
    setAssessmentType(value: AssessmentType): RiskAssessmentResponse;
    getRiskLevel(): RiskLevel;
    setRiskLevel(value: RiskLevel): RiskAssessmentResponse;
    getRiskScore(): number;
    setRiskScore(value: number): RiskAssessmentResponse;
    getStatus(): AssessmentStatus;
    setStatus(value: AssessmentStatus): RiskAssessmentResponse;
    getAssessmentParams(): string;
    setAssessmentParams(value: string): RiskAssessmentResponse;
    getAssessmentResults(): string;
    setAssessmentResults(value: string): RiskAssessmentResponse;
    clearRiskFactorsList(): void;
    getRiskFactorsList(): Array<string>;
    setRiskFactorsList(value: Array<string>): RiskAssessmentResponse;
    addRiskFactors(value: string, index?: number): string;
    clearRecommendationsList(): void;
    getRecommendationsList(): Array<string>;
    setRecommendationsList(value: Array<string>): RiskAssessmentResponse;
    addRecommendations(value: string, index?: number): string;
    getRequiresReview(): boolean;
    setRequiresReview(value: boolean): RiskAssessmentResponse;
    getReviewedBy(): string;
    setReviewedBy(value: string): RiskAssessmentResponse;

    hasReviewedAt(): boolean;
    clearReviewedAt(): void;
    getReviewedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setReviewedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAssessmentResponse;
    getReviewComments(): string;
    setReviewComments(value: string): RiskAssessmentResponse;
    getProcessingTimeMs(): number;
    setProcessingTimeMs(value: number): RiskAssessmentResponse;
    getModelVersion(): string;
    setModelVersion(value: string): RiskAssessmentResponse;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAssessmentResponse;
    getMetadata(): string;
    setMetadata(value: string): RiskAssessmentResponse;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAssessmentResponse;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): RiskAssessmentResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RiskAssessmentResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RiskAssessmentResponse): RiskAssessmentResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RiskAssessmentResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RiskAssessmentResponse;
    static deserializeBinaryFromReader(message: RiskAssessmentResponse, reader: jspb.BinaryReader): RiskAssessmentResponse;
}

export namespace RiskAssessmentResponse {
    export type AsObject = {
        id: string,
        userId: string,
        accountId: string,
        tradeId: string,
        portfolioId: string,
        assessmentType: AssessmentType,
        riskLevel: RiskLevel,
        riskScore: number,
        status: AssessmentStatus,
        assessmentParams: string,
        assessmentResults: string,
        riskFactorsList: Array<string>,
        recommendationsList: Array<string>,
        requiresReview: boolean,
        reviewedBy: string,
        reviewedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        reviewComments: string,
        processingTimeMs: number,
        modelVersion: string,
        expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        metadata: string,
        createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    }
}

export class ListRiskAssessmentsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): ListRiskAssessmentsRequest;
    getAccountId(): string;
    setAccountId(value: string): ListRiskAssessmentsRequest;
    getAssessmentType(): AssessmentType;
    setAssessmentType(value: AssessmentType): ListRiskAssessmentsRequest;
    getRiskLevel(): RiskLevel;
    setRiskLevel(value: RiskLevel): ListRiskAssessmentsRequest;
    getStatus(): AssessmentStatus;
    setStatus(value: AssessmentStatus): ListRiskAssessmentsRequest;

    hasFromDate(): boolean;
    clearFromDate(): void;
    getFromDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setFromDate(value?: google_protobuf_timestamp_pb.Timestamp): ListRiskAssessmentsRequest;

    hasToDate(): boolean;
    clearToDate(): void;
    getToDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
    setToDate(value?: google_protobuf_timestamp_pb.Timestamp): ListRiskAssessmentsRequest;
    getPage(): number;
    setPage(value: number): ListRiskAssessmentsRequest;
    getLimit(): number;
    setLimit(value: number): ListRiskAssessmentsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskAssessmentsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskAssessmentsRequest): ListRiskAssessmentsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskAssessmentsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskAssessmentsRequest;
    static deserializeBinaryFromReader(message: ListRiskAssessmentsRequest, reader: jspb.BinaryReader): ListRiskAssessmentsRequest;
}

export namespace ListRiskAssessmentsRequest {
    export type AsObject = {
        userId: string,
        accountId: string,
        assessmentType: AssessmentType,
        riskLevel: RiskLevel,
        status: AssessmentStatus,
        fromDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        toDate?: google_protobuf_timestamp_pb.Timestamp.AsObject,
        page: number,
        limit: number,
    }
}

export class ListRiskAssessmentsResponse extends jspb.Message { 
    clearAssessmentsList(): void;
    getAssessmentsList(): Array<RiskAssessmentResponse>;
    setAssessmentsList(value: Array<RiskAssessmentResponse>): ListRiskAssessmentsResponse;
    addAssessments(value?: RiskAssessmentResponse, index?: number): RiskAssessmentResponse;
    getTotal(): number;
    setTotal(value: number): ListRiskAssessmentsResponse;
    getPage(): number;
    setPage(value: number): ListRiskAssessmentsResponse;
    getLimit(): number;
    setLimit(value: number): ListRiskAssessmentsResponse;
    getTotalPages(): number;
    setTotalPages(value: number): ListRiskAssessmentsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListRiskAssessmentsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListRiskAssessmentsResponse): ListRiskAssessmentsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListRiskAssessmentsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListRiskAssessmentsResponse;
    static deserializeBinaryFromReader(message: ListRiskAssessmentsResponse, reader: jspb.BinaryReader): ListRiskAssessmentsResponse;
}

export namespace ListRiskAssessmentsResponse {
    export type AsObject = {
        assessmentsList: Array<RiskAssessmentResponse.AsObject>,
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export enum RiskLevel {
    RISK_LEVEL_UNSPECIFIED = 0,
    VERY_LOW = 1,
    LOW = 2,
    MEDIUM = 3,
    HIGH = 4,
    VERY_HIGH = 5,
    CRITICAL = 6,
}

export enum AssessmentType {
    ASSESSMENT_TYPE_UNSPECIFIED = 0,
    TRADE_PRE_EXECUTION = 1,
    TRADE_POST_EXECUTION = 2,
    PORTFOLIO_DAILY = 3,
    PORTFOLIO_REALTIME = 4,
    ACCOUNT_OPENING = 5,
    POSITION_MONITORING = 6,
    MARKET_EVENT = 7,
}

export enum AssessmentStatus {
    ASSESSMENT_STATUS_UNSPECIFIED = 0,
    PENDING = 1,
    COMPLETED = 2,
    FAILED = 3,
    ESCALATED = 4,
}

export enum TradeSide {
    TRADE_SIDE_UNSPECIFIED = 0,
    BUY = 1,
    SELL = 2,
}

export enum ComplianceType {
    COMPLIANCE_TYPE_UNSPECIFIED = 0,
    KYC = 1,
    AML = 2,
    CDD = 3,
    EDD = 4,
    SANCTIONS = 5,
    PEP = 6,
    TRADE_SURVEILLANCE = 7,
    POSITION_LIMITS = 8,
    MARKET_ABUSE = 9,
    INSIDER_TRADING = 10,
    MIFID_II = 11,
    GDPR = 12,
    SOX = 13,
    DODD_FRANK = 14,
}

export enum ComplianceStatus {
    COMPLIANCE_STATUS_UNSPECIFIED = 0,
    COMPLIANCE_PENDING = 1,
    PASSED = 2,
    COMPLIANCE_FAILED = 3,
    REQUIRES_REVIEW = 4,
    COMPLIANCE_ESCALATED = 5,
    EXPIRED = 6,
}

export enum ComplianceSeverity {
    COMPLIANCE_SEVERITY_UNSPECIFIED = 0,
    INFO = 1,
    WARNING = 2,
    MINOR = 3,
    MAJOR = 4,
    COMPLIANCE_CRITICAL = 5,
    REGULATORY_BREACH = 6,
}

export enum DocumentType {
    DOCUMENT_TYPE_UNSPECIFIED = 0,
    PASSPORT = 1,
    DRIVING_LICENSE = 2,
    UTILITY_BILL = 3,
    BANK_STATEMENT = 4,
    TAX_DOCUMENT = 5,
}

export enum RiskProfile {
    RISK_PROFILE_UNSPECIFIED = 0,
    RISK_LOW = 1,
    RISK_MEDIUM = 2,
    RISK_HIGH = 3,
}

export enum InvestmentExperience {
    INVESTMENT_EXPERIENCE_UNSPECIFIED = 0,
    BEGINNER = 1,
    INTERMEDIATE = 2,
    EXPERIENCED = 3,
    PROFESSIONAL = 4,
}

export enum GeographicRisk {
    GEOGRAPHIC_RISK_UNSPECIFIED = 0,
    GEO_LOW = 1,
    GEO_MEDIUM = 2,
    GEO_HIGH = 3,
}

export enum AlertType {
    ALERT_TYPE_UNSPECIFIED = 0,
    RISK_LIMIT_BREACH = 1,
    POSITION_CONCENTRATION = 2,
    DRAWDOWN_THRESHOLD = 3,
    VOLATILITY_SPIKE = 4,
    LIQUIDITY_RISK = 5,
    COUNTERPARTY_RISK = 6,
    MARGIN_CALL = 7,
    SUSPICIOUS_ACTIVITY = 8,
    COMPLIANCE_VIOLATION = 9,
    SYSTEM_ANOMALY = 10,
    FRAUD_DETECTION = 11,
    MARKET_DISRUPTION = 12,
    CORRELATION_BREAKDOWN = 13,
    VAR_BREACH = 14,
    STRESS_TEST_FAILURE = 15,
}

export enum AlertSeverity {
    ALERT_SEVERITY_UNSPECIFIED = 0,
    ALERT_INFO = 1,
    ALERT_LOW = 2,
    ALERT_MEDIUM = 3,
    ALERT_HIGH = 4,
    ALERT_CRITICAL = 5,
    EMERGENCY = 6,
}

export enum AlertStatus {
    ALERT_STATUS_UNSPECIFIED = 0,
    ACTIVE = 1,
    ACKNOWLEDGED = 2,
    IN_PROGRESS = 3,
    RESOLVED = 4,
    DISMISSED = 5,
    ALERT_ESCALATED = 6,
    ALERT_EXPIRED = 7,
}

export enum AlertPriority {
    ALERT_PRIORITY_UNSPECIFIED = 0,
    P1 = 1,
    P2 = 2,
    P3 = 3,
    P4 = 4,
    P5 = 5,
}

export enum LimitType {
    LIMIT_TYPE_UNSPECIFIED = 0,
    POSITION_SIZE = 1,
    PORTFOLIO_VALUE = 2,
    DAILY_LOSS = 3,
    WEEKLY_LOSS = 4,
    MONTHLY_LOSS = 5,
    DRAWDOWN = 6,
    LEVERAGE = 7,
    CONCENTRATION = 8,
    VAR_LIMIT = 9,
    SECTOR_EXPOSURE = 10,
    CURRENCY_EXPOSURE = 11,
    COUNTERPARTY_EXPOSURE = 12,
    TRADE_COUNT = 13,
    TRADE_SIZE = 14,
    INTRADAY_LOSS = 15,
    VOLATILITY_LIMIT = 16,
    CORRELATION_LIMIT = 17,
}

export enum LimitScope {
    LIMIT_SCOPE_UNSPECIFIED = 0,
    USER = 1,
    ACCOUNT = 2,
    PORTFOLIO = 3,
    ASSET_CLASS = 4,
    SECTOR = 5,
    SYMBOL = 6,
    STRATEGY = 7,
    GLOBAL = 8,
}

export enum LimitStatus {
    LIMIT_STATUS_UNSPECIFIED = 0,
    LIMIT_ACTIVE = 1,
    INACTIVE = 2,
    SUSPENDED = 3,
    BREACHED = 4,
    LIMIT_WARNING = 5,
    LIMIT_EXPIRED = 6,
}

export enum LimitFrequency {
    LIMIT_FREQUENCY_UNSPECIFIED = 0,
    REALTIME = 1,
    INTRADAY = 2,
    DAILY = 3,
    WEEKLY = 4,
    MONTHLY = 5,
    QUARTERLY = 6,
    ANNUALLY = 7,
}

export enum MetricType {
    METRIC_TYPE_UNSPECIFIED = 0,
    VALUE_AT_RISK = 1,
    EXPECTED_SHORTFALL = 2,
    MAXIMUM_DRAWDOWN = 3,
    SHARPE_RATIO = 4,
    SORTINO_RATIO = 5,
    METRIC_VOLATILITY = 6,
    BETA = 7,
    ALPHA = 8,
    CORRELATION = 9,
    PORTFOLIO_CONCENTRATION = 10,
    LEVERAGE_RATIO = 11,
    LIQUIDITY_RATIO = 12,
    SECTOR_CONCENTRATION = 13,
    METRIC_CURRENCY_EXPOSURE = 14,
    MARGIN_UTILIZATION = 15,
    POSITION_SIZE_RISK = 16,
    METRIC_COUNTERPARTY_RISK = 17,
}

export enum MetricScope {
    METRIC_SCOPE_UNSPECIFIED = 0,
    METRIC_USER = 1,
    METRIC_ACCOUNT = 2,
    METRIC_PORTFOLIO = 3,
    POSITION = 4,
    METRIC_ASSET_CLASS = 5,
    METRIC_SECTOR = 6,
    METRIC_GLOBAL = 7,
}

export enum MetricFrequency {
    METRIC_FREQUENCY_UNSPECIFIED = 0,
    METRIC_REALTIME = 1,
    MINUTELY = 2,
    HOURLY = 3,
    METRIC_DAILY = 4,
    METRIC_WEEKLY = 5,
    METRIC_MONTHLY = 6,
}

export enum FraudRecommendation {
    FRAUD_RECOMMENDATION_UNSPECIFIED = 0,
    ALLOW = 1,
    CHALLENGE = 2,
    BLOCK = 3,
    REVIEW = 4,
}

export enum FraudSeverity {
    FRAUD_SEVERITY_UNSPECIFIED = 0,
    FRAUD_LOW = 1,
    FRAUD_MEDIUM = 2,
    FRAUD_HIGH = 3,
    FRAUD_CRITICAL = 4,
}

export enum FraudTrend {
    FRAUD_TREND_UNSPECIFIED = 0,
    INCREASING = 1,
    DECREASING = 2,
    STABLE = 3,
}
