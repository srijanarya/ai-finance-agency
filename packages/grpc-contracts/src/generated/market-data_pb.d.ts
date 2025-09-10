// package: marketdata
// file: market-data.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as common_pb from "./common_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";

export class MarketDataPoint extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): MarketDataPoint;
    getPrice(): number;
    setPrice(value: number): MarketDataPoint;

    hasBid(): boolean;
    clearBid(): void;
    getBid(): number | undefined;
    setBid(value: number): MarketDataPoint;

    hasAsk(): boolean;
    clearAsk(): void;
    getAsk(): number | undefined;
    setAsk(value: number): MarketDataPoint;

    hasBidSize(): boolean;
    clearBidSize(): void;
    getBidSize(): number | undefined;
    setBidSize(value: number): MarketDataPoint;

    hasAskSize(): boolean;
    clearAskSize(): void;
    getAskSize(): number | undefined;
    setAskSize(value: number): MarketDataPoint;
    getVolume(): number;
    setVolume(value: number): MarketDataPoint;

    hasPreviousClose(): boolean;
    clearPreviousClose(): void;
    getPreviousClose(): number | undefined;
    setPreviousClose(value: number): MarketDataPoint;

    hasChange(): boolean;
    clearChange(): void;
    getChange(): number | undefined;
    setChange(value: number): MarketDataPoint;

    hasChangePercent(): boolean;
    clearChangePercent(): void;
    getChangePercent(): number | undefined;
    setChangePercent(value: number): MarketDataPoint;

    hasDayHigh(): boolean;
    clearDayHigh(): void;
    getDayHigh(): number | undefined;
    setDayHigh(value: number): MarketDataPoint;

    hasDayLow(): boolean;
    clearDayLow(): void;
    getDayLow(): number | undefined;
    setDayLow(value: number): MarketDataPoint;

    hasMarketCap(): boolean;
    clearMarketCap(): void;
    getMarketCap(): number | undefined;
    setMarketCap(value: number): MarketDataPoint;
    getSource(): DataSource;
    setSource(value: DataSource): MarketDataPoint;
    getTimestamp(): number;
    setTimestamp(value: number): MarketDataPoint;
    getIsMarketOpen(): boolean;
    setIsMarketOpen(value: boolean): MarketDataPoint;

    hasMarketSession(): boolean;
    clearMarketSession(): void;
    getMarketSession(): string | undefined;
    setMarketSession(value: string): MarketDataPoint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarketDataPoint.AsObject;
    static toObject(includeInstance: boolean, msg: MarketDataPoint): MarketDataPoint.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarketDataPoint, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarketDataPoint;
    static deserializeBinaryFromReader(message: MarketDataPoint, reader: jspb.BinaryReader): MarketDataPoint;
}

export namespace MarketDataPoint {
    export type AsObject = {
        symbol: string,
        price: number,
        bid?: number,
        ask?: number,
        bidSize?: number,
        askSize?: number,
        volume: number,
        previousClose?: number,
        change?: number,
        changePercent?: number,
        dayHigh?: number,
        dayLow?: number,
        marketCap?: number,
        source: DataSource,
        timestamp: number,
        isMarketOpen: boolean,
        marketSession?: string,
    }
}

export class HistoricalDataPoint extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): HistoricalDataPoint;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): HistoricalDataPoint;
    getOpen(): number;
    setOpen(value: number): HistoricalDataPoint;
    getHigh(): number;
    setHigh(value: number): HistoricalDataPoint;
    getLow(): number;
    setLow(value: number): HistoricalDataPoint;
    getClose(): number;
    setClose(value: number): HistoricalDataPoint;

    hasAdjustedClose(): boolean;
    clearAdjustedClose(): void;
    getAdjustedClose(): number | undefined;
    setAdjustedClose(value: number): HistoricalDataPoint;
    getVolume(): number;
    setVolume(value: number): HistoricalDataPoint;

    hasVwap(): boolean;
    clearVwap(): void;
    getVwap(): number | undefined;
    setVwap(value: number): HistoricalDataPoint;
    getSource(): DataSource;
    setSource(value: DataSource): HistoricalDataPoint;
    getTimestamp(): number;
    setTimestamp(value: number): HistoricalDataPoint;

    hasTradeCount(): boolean;
    clearTradeCount(): void;
    getTradeCount(): number | undefined;
    setTradeCount(value: number): HistoricalDataPoint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HistoricalDataPoint.AsObject;
    static toObject(includeInstance: boolean, msg: HistoricalDataPoint): HistoricalDataPoint.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HistoricalDataPoint, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HistoricalDataPoint;
    static deserializeBinaryFromReader(message: HistoricalDataPoint, reader: jspb.BinaryReader): HistoricalDataPoint;
}

export namespace HistoricalDataPoint {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        open: number,
        high: number,
        low: number,
        close: number,
        adjustedClose?: number,
        volume: number,
        vwap?: number,
        source: DataSource,
        timestamp: number,
        tradeCount?: number,
    }
}

export class Alert extends jspb.Message { 
    getId(): string;
    setId(value: string): Alert;
    getUserId(): string;
    setUserId(value: string): Alert;
    getSymbol(): string;
    setSymbol(value: string): Alert;
    getAlertType(): AlertType;
    setAlertType(value: AlertType): Alert;
    getTitle(): string;
    setTitle(value: string): Alert;

    hasDescription(): boolean;
    clearDescription(): void;
    getDescription(): string | undefined;
    setDescription(value: string): Alert;

    getConditionsMap(): jspb.Map<string, string>;
    clearConditionsMap(): void;

    hasTargetPrice(): boolean;
    clearTargetPrice(): void;
    getTargetPrice(): number | undefined;
    setTargetPrice(value: number): Alert;

    hasPercentageThreshold(): boolean;
    clearPercentageThreshold(): void;
    getPercentageThreshold(): number | undefined;
    setPercentageThreshold(value: number): Alert;

    hasVolumeThreshold(): boolean;
    clearVolumeThreshold(): void;
    getVolumeThreshold(): number | undefined;
    setVolumeThreshold(value: number): Alert;
    getStatus(): AlertStatus;
    setStatus(value: AlertStatus): Alert;
    getPriority(): AlertPriority;
    setPriority(value: AlertPriority): Alert;
    getIsRecurring(): boolean;
    setIsRecurring(value: boolean): Alert;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): number | undefined;
    setExpiresAt(value: number): Alert;

    hasTriggeredAt(): boolean;
    clearTriggeredAt(): void;
    getTriggeredAt(): number | undefined;
    setTriggeredAt(value: number): Alert;

    hasTriggeredPrice(): boolean;
    clearTriggeredPrice(): void;
    getTriggeredPrice(): number | undefined;
    setTriggeredPrice(value: number): Alert;
    getTriggerCount(): number;
    setTriggerCount(value: number): Alert;

    hasLastNotificationAt(): boolean;
    clearLastNotificationAt(): void;
    getLastNotificationAt(): number | undefined;
    setLastNotificationAt(value: number): Alert;
    clearNotificationMethodsList(): void;
    getNotificationMethodsList(): Array<string>;
    setNotificationMethodsList(value: Array<string>): Alert;
    addNotificationMethods(value: string, index?: number): string;
    getCreatedAt(): number;
    setCreatedAt(value: number): Alert;
    getUpdatedAt(): number;
    setUpdatedAt(value: number): Alert;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Alert.AsObject;
    static toObject(includeInstance: boolean, msg: Alert): Alert.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Alert, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Alert;
    static deserializeBinaryFromReader(message: Alert, reader: jspb.BinaryReader): Alert;
}

export namespace Alert {
    export type AsObject = {
        id: string,
        userId: string,
        symbol: string,
        alertType: AlertType,
        title: string,
        description?: string,

        conditionsMap: Array<[string, string]>,
        targetPrice?: number,
        percentageThreshold?: number,
        volumeThreshold?: number,
        status: AlertStatus,
        priority: AlertPriority,
        isRecurring: boolean,
        expiresAt?: number,
        triggeredAt?: number,
        triggeredPrice?: number,
        triggerCount: number,
        lastNotificationAt?: number,
        notificationMethodsList: Array<string>,
        createdAt: number,
        updatedAt: number,
    }
}

export class WatchlistItem extends jspb.Message { 
    getId(): string;
    setId(value: string): WatchlistItem;
    getUserId(): string;
    setUserId(value: string): WatchlistItem;
    getSymbol(): string;
    setSymbol(value: string): WatchlistItem;

    hasDisplayName(): boolean;
    clearDisplayName(): void;
    getDisplayName(): string | undefined;
    setDisplayName(value: string): WatchlistItem;

    hasNotes(): boolean;
    clearNotes(): void;
    getNotes(): string | undefined;
    setNotes(value: string): WatchlistItem;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): WatchlistItem;
    addTags(value: string, index?: number): string;
    getSortOrder(): number;
    setSortOrder(value: number): WatchlistItem;

    hasTargetBuyPrice(): boolean;
    clearTargetBuyPrice(): void;
    getTargetBuyPrice(): number | undefined;
    setTargetBuyPrice(value: number): WatchlistItem;

    hasTargetSellPrice(): boolean;
    clearTargetSellPrice(): void;
    getTargetSellPrice(): number | undefined;
    setTargetSellPrice(value: number): WatchlistItem;

    hasStopLossPrice(): boolean;
    clearStopLossPrice(): void;
    getStopLossPrice(): number | undefined;
    setStopLossPrice(value: number): WatchlistItem;
    getIsActive(): boolean;
    setIsActive(value: boolean): WatchlistItem;
    getEnableAlerts(): boolean;
    setEnableAlerts(value: boolean): WatchlistItem;

    hasAddedAtPrice(): boolean;
    clearAddedAtPrice(): void;
    getAddedAtPrice(): number | undefined;
    setAddedAtPrice(value: number): WatchlistItem;
    getCreatedAt(): number;
    setCreatedAt(value: number): WatchlistItem;
    getUpdatedAt(): number;
    setUpdatedAt(value: number): WatchlistItem;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WatchlistItem.AsObject;
    static toObject(includeInstance: boolean, msg: WatchlistItem): WatchlistItem.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WatchlistItem, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WatchlistItem;
    static deserializeBinaryFromReader(message: WatchlistItem, reader: jspb.BinaryReader): WatchlistItem;
}

export namespace WatchlistItem {
    export type AsObject = {
        id: string,
        userId: string,
        symbol: string,
        displayName?: string,
        notes?: string,
        tagsList: Array<string>,
        sortOrder: number,
        targetBuyPrice?: number,
        targetSellPrice?: number,
        stopLossPrice?: number,
        isActive: boolean,
        enableAlerts: boolean,
        addedAtPrice?: number,
        createdAt: number,
        updatedAt: number,
    }
}

export class WatchlistItemWithMarketData extends jspb.Message { 

    hasWatchlistItem(): boolean;
    clearWatchlistItem(): void;
    getWatchlistItem(): WatchlistItem | undefined;
    setWatchlistItem(value?: WatchlistItem): WatchlistItemWithMarketData;

    hasMarketData(): boolean;
    clearMarketData(): void;
    getMarketData(): MarketDataPoint | undefined;
    setMarketData(value?: MarketDataPoint): WatchlistItemWithMarketData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WatchlistItemWithMarketData.AsObject;
    static toObject(includeInstance: boolean, msg: WatchlistItemWithMarketData): WatchlistItemWithMarketData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WatchlistItemWithMarketData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WatchlistItemWithMarketData;
    static deserializeBinaryFromReader(message: WatchlistItemWithMarketData, reader: jspb.BinaryReader): WatchlistItemWithMarketData;
}

export namespace WatchlistItemWithMarketData {
    export type AsObject = {
        watchlistItem?: WatchlistItem.AsObject,
        marketData?: MarketDataPoint.AsObject,
    }
}

export class RSIValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): RSIValue;
    getRsi(): number;
    setRsi(value: number): RSIValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RSIValue.AsObject;
    static toObject(includeInstance: boolean, msg: RSIValue): RSIValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RSIValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RSIValue;
    static deserializeBinaryFromReader(message: RSIValue, reader: jspb.BinaryReader): RSIValue;
}

export namespace RSIValue {
    export type AsObject = {
        timestamp: number,
        rsi: number,
    }
}

export class RSI extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): RSI;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): RSI;
    clearValuesList(): void;
    getValuesList(): Array<RSIValue>;
    setValuesList(value: Array<RSIValue>): RSI;
    addValues(value?: RSIValue, index?: number): RSIValue;
    getCurrentRsi(): number;
    setCurrentRsi(value: number): RSI;
    getSignal(): string;
    setSignal(value: string): RSI;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RSI.AsObject;
    static toObject(includeInstance: boolean, msg: RSI): RSI.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RSI, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RSI;
    static deserializeBinaryFromReader(message: RSI, reader: jspb.BinaryReader): RSI;
}

export namespace RSI {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        valuesList: Array<RSIValue.AsObject>,
        currentRsi: number,
        signal: string,
    }
}

export class MACDValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): MACDValue;
    getMacd(): number;
    setMacd(value: number): MACDValue;
    getSignal(): number;
    setSignal(value: number): MACDValue;
    getHistogram(): number;
    setHistogram(value: number): MACDValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MACDValue.AsObject;
    static toObject(includeInstance: boolean, msg: MACDValue): MACDValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MACDValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MACDValue;
    static deserializeBinaryFromReader(message: MACDValue, reader: jspb.BinaryReader): MACDValue;
}

export namespace MACDValue {
    export type AsObject = {
        timestamp: number,
        macd: number,
        signal: number,
        histogram: number,
    }
}

export class MACDCurrent extends jspb.Message { 
    getMacd(): number;
    setMacd(value: number): MACDCurrent;
    getSignal(): number;
    setSignal(value: number): MACDCurrent;
    getHistogram(): number;
    setHistogram(value: number): MACDCurrent;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MACDCurrent.AsObject;
    static toObject(includeInstance: boolean, msg: MACDCurrent): MACDCurrent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MACDCurrent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MACDCurrent;
    static deserializeBinaryFromReader(message: MACDCurrent, reader: jspb.BinaryReader): MACDCurrent;
}

export namespace MACDCurrent {
    export type AsObject = {
        macd: number,
        signal: number,
        histogram: number,
    }
}

export class MACD extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): MACD;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): MACD;
    clearValuesList(): void;
    getValuesList(): Array<MACDValue>;
    setValuesList(value: Array<MACDValue>): MACD;
    addValues(value?: MACDValue, index?: number): MACDValue;

    hasCurrentMacd(): boolean;
    clearCurrentMacd(): void;
    getCurrentMacd(): MACDCurrent | undefined;
    setCurrentMacd(value?: MACDCurrent): MACD;
    getCrossover(): string;
    setCrossover(value: string): MACD;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MACD.AsObject;
    static toObject(includeInstance: boolean, msg: MACD): MACD.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MACD, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MACD;
    static deserializeBinaryFromReader(message: MACD, reader: jspb.BinaryReader): MACD;
}

export namespace MACD {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        valuesList: Array<MACDValue.AsObject>,
        currentMacd?: MACDCurrent.AsObject,
        crossover: string,
    }
}

export class BollingerBandsValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): BollingerBandsValue;
    getUpper(): number;
    setUpper(value: number): BollingerBandsValue;
    getMiddle(): number;
    setMiddle(value: number): BollingerBandsValue;
    getLower(): number;
    setLower(value: number): BollingerBandsValue;
    getPrice(): number;
    setPrice(value: number): BollingerBandsValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BollingerBandsValue.AsObject;
    static toObject(includeInstance: boolean, msg: BollingerBandsValue): BollingerBandsValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BollingerBandsValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BollingerBandsValue;
    static deserializeBinaryFromReader(message: BollingerBandsValue, reader: jspb.BinaryReader): BollingerBandsValue;
}

export namespace BollingerBandsValue {
    export type AsObject = {
        timestamp: number,
        upper: number,
        middle: number,
        lower: number,
        price: number,
    }
}

export class BollingerBandsCurrent extends jspb.Message { 
    getUpper(): number;
    setUpper(value: number): BollingerBandsCurrent;
    getMiddle(): number;
    setMiddle(value: number): BollingerBandsCurrent;
    getLower(): number;
    setLower(value: number): BollingerBandsCurrent;
    getPrice(): number;
    setPrice(value: number): BollingerBandsCurrent;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BollingerBandsCurrent.AsObject;
    static toObject(includeInstance: boolean, msg: BollingerBandsCurrent): BollingerBandsCurrent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BollingerBandsCurrent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BollingerBandsCurrent;
    static deserializeBinaryFromReader(message: BollingerBandsCurrent, reader: jspb.BinaryReader): BollingerBandsCurrent;
}

export namespace BollingerBandsCurrent {
    export type AsObject = {
        upper: number,
        middle: number,
        lower: number,
        price: number,
    }
}

export class BollingerBands extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): BollingerBands;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): BollingerBands;
    clearValuesList(): void;
    getValuesList(): Array<BollingerBandsValue>;
    setValuesList(value: Array<BollingerBandsValue>): BollingerBands;
    addValues(value?: BollingerBandsValue, index?: number): BollingerBandsValue;

    hasCurrentBands(): boolean;
    clearCurrentBands(): void;
    getCurrentBands(): BollingerBandsCurrent | undefined;
    setCurrentBands(value?: BollingerBandsCurrent): BollingerBands;
    getSignal(): string;
    setSignal(value: string): BollingerBands;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BollingerBands.AsObject;
    static toObject(includeInstance: boolean, msg: BollingerBands): BollingerBands.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BollingerBands, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BollingerBands;
    static deserializeBinaryFromReader(message: BollingerBands, reader: jspb.BinaryReader): BollingerBands;
}

export namespace BollingerBands {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        valuesList: Array<BollingerBandsValue.AsObject>,
        currentBands?: BollingerBandsCurrent.AsObject,
        signal: string,
    }
}

export class MovingAverageValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): MovingAverageValue;
    getMa(): number;
    setMa(value: number): MovingAverageValue;
    getPrice(): number;
    setPrice(value: number): MovingAverageValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MovingAverageValue.AsObject;
    static toObject(includeInstance: boolean, msg: MovingAverageValue): MovingAverageValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MovingAverageValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MovingAverageValue;
    static deserializeBinaryFromReader(message: MovingAverageValue, reader: jspb.BinaryReader): MovingAverageValue;
}

export namespace MovingAverageValue {
    export type AsObject = {
        timestamp: number,
        ma: number,
        price: number,
    }
}

export class MovingAverage extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): MovingAverage;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): MovingAverage;
    getType(): string;
    setType(value: string): MovingAverage;
    getPeriod(): number;
    setPeriod(value: number): MovingAverage;
    clearValuesList(): void;
    getValuesList(): Array<MovingAverageValue>;
    setValuesList(value: Array<MovingAverageValue>): MovingAverage;
    addValues(value?: MovingAverageValue, index?: number): MovingAverageValue;
    getCurrentMa(): number;
    setCurrentMa(value: number): MovingAverage;
    getCurrentPrice(): number;
    setCurrentPrice(value: number): MovingAverage;
    getSignal(): string;
    setSignal(value: string): MovingAverage;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MovingAverage.AsObject;
    static toObject(includeInstance: boolean, msg: MovingAverage): MovingAverage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MovingAverage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MovingAverage;
    static deserializeBinaryFromReader(message: MovingAverage, reader: jspb.BinaryReader): MovingAverage;
}

export namespace MovingAverage {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        type: string,
        period: number,
        valuesList: Array<MovingAverageValue.AsObject>,
        currentMa: number,
        currentPrice: number,
        signal: string,
    }
}

export class StochasticValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): StochasticValue;
    getK(): number;
    setK(value: number): StochasticValue;
    getD(): number;
    setD(value: number): StochasticValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StochasticValue.AsObject;
    static toObject(includeInstance: boolean, msg: StochasticValue): StochasticValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StochasticValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StochasticValue;
    static deserializeBinaryFromReader(message: StochasticValue, reader: jspb.BinaryReader): StochasticValue;
}

export namespace StochasticValue {
    export type AsObject = {
        timestamp: number,
        k: number,
        d: number,
    }
}

export class StochasticCurrent extends jspb.Message { 
    getK(): number;
    setK(value: number): StochasticCurrent;
    getD(): number;
    setD(value: number): StochasticCurrent;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StochasticCurrent.AsObject;
    static toObject(includeInstance: boolean, msg: StochasticCurrent): StochasticCurrent.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StochasticCurrent, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StochasticCurrent;
    static deserializeBinaryFromReader(message: StochasticCurrent, reader: jspb.BinaryReader): StochasticCurrent;
}

export namespace StochasticCurrent {
    export type AsObject = {
        k: number,
        d: number,
    }
}

export class Stochastic extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): Stochastic;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): Stochastic;
    clearValuesList(): void;
    getValuesList(): Array<StochasticValue>;
    setValuesList(value: Array<StochasticValue>): Stochastic;
    addValues(value?: StochasticValue, index?: number): StochasticValue;

    hasCurrentStochastic(): boolean;
    clearCurrentStochastic(): void;
    getCurrentStochastic(): StochasticCurrent | undefined;
    setCurrentStochastic(value?: StochasticCurrent): Stochastic;
    getSignal(): string;
    setSignal(value: string): Stochastic;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Stochastic.AsObject;
    static toObject(includeInstance: boolean, msg: Stochastic): Stochastic.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Stochastic, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Stochastic;
    static deserializeBinaryFromReader(message: Stochastic, reader: jspb.BinaryReader): Stochastic;
}

export namespace Stochastic {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        valuesList: Array<StochasticValue.AsObject>,
        currentStochastic?: StochasticCurrent.AsObject,
        signal: string,
    }
}

export class OBVValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): OBVValue;
    getObv(): number;
    setObv(value: number): OBVValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): OBVValue.AsObject;
    static toObject(includeInstance: boolean, msg: OBVValue): OBVValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: OBVValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): OBVValue;
    static deserializeBinaryFromReader(message: OBVValue, reader: jspb.BinaryReader): OBVValue;
}

export namespace OBVValue {
    export type AsObject = {
        timestamp: number,
        obv: number,
    }
}

export class VolumeSMAValue extends jspb.Message { 
    getTimestamp(): number;
    setTimestamp(value: number): VolumeSMAValue;
    getVolumeSma(): number;
    setVolumeSma(value: number): VolumeSMAValue;
    getVolume(): number;
    setVolume(value: number): VolumeSMAValue;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VolumeSMAValue.AsObject;
    static toObject(includeInstance: boolean, msg: VolumeSMAValue): VolumeSMAValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VolumeSMAValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VolumeSMAValue;
    static deserializeBinaryFromReader(message: VolumeSMAValue, reader: jspb.BinaryReader): VolumeSMAValue;
}

export namespace VolumeSMAValue {
    export type AsObject = {
        timestamp: number,
        volumeSma: number,
        volume: number,
    }
}

export class VolumeIndicators extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): VolumeIndicators;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): VolumeIndicators;
    clearObvList(): void;
    getObvList(): Array<OBVValue>;
    setObvList(value: Array<OBVValue>): VolumeIndicators;
    addObv(value?: OBVValue, index?: number): OBVValue;
    clearVolumeSmaList(): void;
    getVolumeSmaList(): Array<VolumeSMAValue>;
    setVolumeSmaList(value: Array<VolumeSMAValue>): VolumeIndicators;
    addVolumeSma(value?: VolumeSMAValue, index?: number): VolumeSMAValue;
    getVolumeSpike(): boolean;
    setVolumeSpike(value: boolean): VolumeIndicators;
    getCurrentObv(): number;
    setCurrentObv(value: number): VolumeIndicators;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VolumeIndicators.AsObject;
    static toObject(includeInstance: boolean, msg: VolumeIndicators): VolumeIndicators.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VolumeIndicators, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VolumeIndicators;
    static deserializeBinaryFromReader(message: VolumeIndicators, reader: jspb.BinaryReader): VolumeIndicators;
}

export namespace VolumeIndicators {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        obvList: Array<OBVValue.AsObject>,
        volumeSmaList: Array<VolumeSMAValue.AsObject>,
        volumeSpike: boolean,
        currentObv: number,
    }
}

export class VolumeProfileLevel extends jspb.Message { 
    getPrice(): number;
    setPrice(value: number): VolumeProfileLevel;
    getVolume(): number;
    setVolume(value: number): VolumeProfileLevel;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VolumeProfileLevel.AsObject;
    static toObject(includeInstance: boolean, msg: VolumeProfileLevel): VolumeProfileLevel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VolumeProfileLevel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VolumeProfileLevel;
    static deserializeBinaryFromReader(message: VolumeProfileLevel, reader: jspb.BinaryReader): VolumeProfileLevel;
}

export namespace VolumeProfileLevel {
    export type AsObject = {
        price: number,
        volume: number,
    }
}

export class Signal extends jspb.Message { 
    getIndicator(): string;
    setIndicator(value: string): Signal;
    getSignal(): string;
    setSignal(value: string): Signal;
    getStrength(): string;
    setStrength(value: string): Signal;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Signal.AsObject;
    static toObject(includeInstance: boolean, msg: Signal): Signal.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Signal, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Signal;
    static deserializeBinaryFromReader(message: Signal, reader: jspb.BinaryReader): Signal;
}

export namespace Signal {
    export type AsObject = {
        indicator: string,
        signal: string,
        strength: string,
    }
}

export class ComprehensiveAnalysis extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): ComprehensiveAnalysis;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): ComprehensiveAnalysis;
    getTimestamp(): number;
    setTimestamp(value: number): ComprehensiveAnalysis;

    hasRsi(): boolean;
    clearRsi(): void;
    getRsi(): RSI | undefined;
    setRsi(value?: RSI): ComprehensiveAnalysis;

    hasMacd(): boolean;
    clearMacd(): void;
    getMacd(): MACD | undefined;
    setMacd(value?: MACD): ComprehensiveAnalysis;

    hasBollingerBands(): boolean;
    clearBollingerBands(): void;
    getBollingerBands(): BollingerBands | undefined;
    setBollingerBands(value?: BollingerBands): ComprehensiveAnalysis;

    hasSma20(): boolean;
    clearSma20(): void;
    getSma20(): MovingAverage | undefined;
    setSma20(value?: MovingAverage): ComprehensiveAnalysis;

    hasEma20(): boolean;
    clearEma20(): void;
    getEma20(): MovingAverage | undefined;
    setEma20(value?: MovingAverage): ComprehensiveAnalysis;

    hasStochastic(): boolean;
    clearStochastic(): void;
    getStochastic(): Stochastic | undefined;
    setStochastic(value?: Stochastic): ComprehensiveAnalysis;

    hasVolumeIndicators(): boolean;
    clearVolumeIndicators(): void;
    getVolumeIndicators(): VolumeIndicators | undefined;
    setVolumeIndicators(value?: VolumeIndicators): ComprehensiveAnalysis;
    getOverallSignal(): string;
    setOverallSignal(value: string): ComprehensiveAnalysis;
    clearSignalsList(): void;
    getSignalsList(): Array<Signal>;
    setSignalsList(value: Array<Signal>): ComprehensiveAnalysis;
    addSignals(value?: Signal, index?: number): Signal;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComprehensiveAnalysis.AsObject;
    static toObject(includeInstance: boolean, msg: ComprehensiveAnalysis): ComprehensiveAnalysis.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComprehensiveAnalysis, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComprehensiveAnalysis;
    static deserializeBinaryFromReader(message: ComprehensiveAnalysis, reader: jspb.BinaryReader): ComprehensiveAnalysis;
}

export namespace ComprehensiveAnalysis {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        timestamp: number,
        rsi?: RSI.AsObject,
        macd?: MACD.AsObject,
        bollingerBands?: BollingerBands.AsObject,
        sma20?: MovingAverage.AsObject,
        ema20?: MovingAverage.AsObject,
        stochastic?: Stochastic.AsObject,
        volumeIndicators?: VolumeIndicators.AsObject,
        overallSignal: string,
        signalsList: Array<Signal.AsObject>,
    }
}

export class GetRealtimeDataRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetRealtimeDataRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRealtimeDataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRealtimeDataRequest): GetRealtimeDataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRealtimeDataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRealtimeDataRequest;
    static deserializeBinaryFromReader(message: GetRealtimeDataRequest, reader: jspb.BinaryReader): GetRealtimeDataRequest;
}

export namespace GetRealtimeDataRequest {
    export type AsObject = {
        symbol: string,
    }
}

export class GetBatchRealtimeDataRequest extends jspb.Message { 
    clearSymbolsList(): void;
    getSymbolsList(): Array<string>;
    setSymbolsList(value: Array<string>): GetBatchRealtimeDataRequest;
    addSymbols(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBatchRealtimeDataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetBatchRealtimeDataRequest): GetBatchRealtimeDataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBatchRealtimeDataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBatchRealtimeDataRequest;
    static deserializeBinaryFromReader(message: GetBatchRealtimeDataRequest, reader: jspb.BinaryReader): GetBatchRealtimeDataRequest;
}

export namespace GetBatchRealtimeDataRequest {
    export type AsObject = {
        symbolsList: Array<string>,
    }
}

export class StreamMarketDataRequest extends jspb.Message { 
    clearSymbolsList(): void;
    getSymbolsList(): Array<string>;
    setSymbolsList(value: Array<string>): StreamMarketDataRequest;
    addSymbols(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamMarketDataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StreamMarketDataRequest): StreamMarketDataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamMarketDataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamMarketDataRequest;
    static deserializeBinaryFromReader(message: StreamMarketDataRequest, reader: jspb.BinaryReader): StreamMarketDataRequest;
}

export namespace StreamMarketDataRequest {
    export type AsObject = {
        symbolsList: Array<string>,
    }
}

export class GetHistoricalDataRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetHistoricalDataRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetHistoricalDataRequest;

    hasStartDate(): boolean;
    clearStartDate(): void;
    getStartDate(): number | undefined;
    setStartDate(value: number): GetHistoricalDataRequest;

    hasEndDate(): boolean;
    clearEndDate(): void;
    getEndDate(): number | undefined;
    setEndDate(value: number): GetHistoricalDataRequest;

    hasLimit(): boolean;
    clearLimit(): void;
    getLimit(): number | undefined;
    setLimit(value: number): GetHistoricalDataRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetHistoricalDataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetHistoricalDataRequest): GetHistoricalDataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetHistoricalDataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetHistoricalDataRequest;
    static deserializeBinaryFromReader(message: GetHistoricalDataRequest, reader: jspb.BinaryReader): GetHistoricalDataRequest;
}

export namespace GetHistoricalDataRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        startDate?: number,
        endDate?: number,
        limit?: number,
    }
}

export class GetOHLCDataRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetOHLCDataRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetOHLCDataRequest;

    hasStartDate(): boolean;
    clearStartDate(): void;
    getStartDate(): number | undefined;
    setStartDate(value: number): GetOHLCDataRequest;

    hasEndDate(): boolean;
    clearEndDate(): void;
    getEndDate(): number | undefined;
    setEndDate(value: number): GetOHLCDataRequest;

    hasLimit(): boolean;
    clearLimit(): void;
    getLimit(): number | undefined;
    setLimit(value: number): GetOHLCDataRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetOHLCDataRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetOHLCDataRequest): GetOHLCDataRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetOHLCDataRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetOHLCDataRequest;
    static deserializeBinaryFromReader(message: GetOHLCDataRequest, reader: jspb.BinaryReader): GetOHLCDataRequest;
}

export namespace GetOHLCDataRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        startDate?: number,
        endDate?: number,
        limit?: number,
    }
}

export class GetVolumeProfileRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetVolumeProfileRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetVolumeProfileRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetVolumeProfileRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetVolumeProfileRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetVolumeProfileRequest): GetVolumeProfileRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetVolumeProfileRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetVolumeProfileRequest;
    static deserializeBinaryFromReader(message: GetVolumeProfileRequest, reader: jspb.BinaryReader): GetVolumeProfileRequest;
}

export namespace GetVolumeProfileRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        days?: number,
    }
}

export class GetRSIRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetRSIRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetRSIRequest;

    hasPeriod(): boolean;
    clearPeriod(): void;
    getPeriod(): number | undefined;
    setPeriod(value: number): GetRSIRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetRSIRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetRSIRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetRSIRequest): GetRSIRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetRSIRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetRSIRequest;
    static deserializeBinaryFromReader(message: GetRSIRequest, reader: jspb.BinaryReader): GetRSIRequest;
}

export namespace GetRSIRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        period?: number,
        days?: number,
    }
}

export class GetMACDRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetMACDRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetMACDRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetMACDRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMACDRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetMACDRequest): GetMACDRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMACDRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMACDRequest;
    static deserializeBinaryFromReader(message: GetMACDRequest, reader: jspb.BinaryReader): GetMACDRequest;
}

export namespace GetMACDRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        days?: number,
    }
}

export class GetBollingerBandsRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetBollingerBandsRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetBollingerBandsRequest;

    hasPeriod(): boolean;
    clearPeriod(): void;
    getPeriod(): number | undefined;
    setPeriod(value: number): GetBollingerBandsRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetBollingerBandsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetBollingerBandsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetBollingerBandsRequest): GetBollingerBandsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetBollingerBandsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetBollingerBandsRequest;
    static deserializeBinaryFromReader(message: GetBollingerBandsRequest, reader: jspb.BinaryReader): GetBollingerBandsRequest;
}

export namespace GetBollingerBandsRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        period?: number,
        days?: number,
    }
}

export class GetMovingAverageRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetMovingAverageRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetMovingAverageRequest;
    getType(): string;
    setType(value: string): GetMovingAverageRequest;

    hasPeriod(): boolean;
    clearPeriod(): void;
    getPeriod(): number | undefined;
    setPeriod(value: number): GetMovingAverageRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetMovingAverageRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetMovingAverageRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetMovingAverageRequest): GetMovingAverageRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetMovingAverageRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetMovingAverageRequest;
    static deserializeBinaryFromReader(message: GetMovingAverageRequest, reader: jspb.BinaryReader): GetMovingAverageRequest;
}

export namespace GetMovingAverageRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        type: string,
        period?: number,
        days?: number,
    }
}

export class GetStochasticRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetStochasticRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetStochasticRequest;

    hasPeriod(): boolean;
    clearPeriod(): void;
    getPeriod(): number | undefined;
    setPeriod(value: number): GetStochasticRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetStochasticRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetStochasticRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetStochasticRequest): GetStochasticRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetStochasticRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetStochasticRequest;
    static deserializeBinaryFromReader(message: GetStochasticRequest, reader: jspb.BinaryReader): GetStochasticRequest;
}

export namespace GetStochasticRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        period?: number,
        days?: number,
    }
}

export class GetVolumeIndicatorsRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetVolumeIndicatorsRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetVolumeIndicatorsRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetVolumeIndicatorsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetVolumeIndicatorsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetVolumeIndicatorsRequest): GetVolumeIndicatorsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetVolumeIndicatorsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetVolumeIndicatorsRequest;
    static deserializeBinaryFromReader(message: GetVolumeIndicatorsRequest, reader: jspb.BinaryReader): GetVolumeIndicatorsRequest;
}

export namespace GetVolumeIndicatorsRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        days?: number,
    }
}

export class GetComprehensiveAnalysisRequest extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): GetComprehensiveAnalysisRequest;
    getInterval(): TimeInterval;
    setInterval(value: TimeInterval): GetComprehensiveAnalysisRequest;

    hasDays(): boolean;
    clearDays(): void;
    getDays(): number | undefined;
    setDays(value: number): GetComprehensiveAnalysisRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetComprehensiveAnalysisRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetComprehensiveAnalysisRequest): GetComprehensiveAnalysisRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetComprehensiveAnalysisRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetComprehensiveAnalysisRequest;
    static deserializeBinaryFromReader(message: GetComprehensiveAnalysisRequest, reader: jspb.BinaryReader): GetComprehensiveAnalysisRequest;
}

export namespace GetComprehensiveAnalysisRequest {
    export type AsObject = {
        symbol: string,
        interval: TimeInterval,
        days?: number,
    }
}

export class CreateAlertRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): CreateAlertRequest;
    getSymbol(): string;
    setSymbol(value: string): CreateAlertRequest;
    getAlertType(): AlertType;
    setAlertType(value: AlertType): CreateAlertRequest;
    getTitle(): string;
    setTitle(value: string): CreateAlertRequest;

    hasDescription(): boolean;
    clearDescription(): void;
    getDescription(): string | undefined;
    setDescription(value: string): CreateAlertRequest;

    getConditionsMap(): jspb.Map<string, string>;
    clearConditionsMap(): void;

    hasTargetPrice(): boolean;
    clearTargetPrice(): void;
    getTargetPrice(): number | undefined;
    setTargetPrice(value: number): CreateAlertRequest;

    hasPercentageThreshold(): boolean;
    clearPercentageThreshold(): void;
    getPercentageThreshold(): number | undefined;
    setPercentageThreshold(value: number): CreateAlertRequest;

    hasVolumeThreshold(): boolean;
    clearVolumeThreshold(): void;
    getVolumeThreshold(): number | undefined;
    setVolumeThreshold(value: number): CreateAlertRequest;

    hasPriority(): boolean;
    clearPriority(): void;
    getPriority(): AlertPriority | undefined;
    setPriority(value: AlertPriority): CreateAlertRequest;

    hasIsRecurring(): boolean;
    clearIsRecurring(): void;
    getIsRecurring(): boolean | undefined;
    setIsRecurring(value: boolean): CreateAlertRequest;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): number | undefined;
    setExpiresAt(value: number): CreateAlertRequest;
    clearNotificationMethodsList(): void;
    getNotificationMethodsList(): Array<string>;
    setNotificationMethodsList(value: Array<string>): CreateAlertRequest;
    addNotificationMethods(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CreateAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CreateAlertRequest): CreateAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CreateAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CreateAlertRequest;
    static deserializeBinaryFromReader(message: CreateAlertRequest, reader: jspb.BinaryReader): CreateAlertRequest;
}

export namespace CreateAlertRequest {
    export type AsObject = {
        userId: string,
        symbol: string,
        alertType: AlertType,
        title: string,
        description?: string,

        conditionsMap: Array<[string, string]>,
        targetPrice?: number,
        percentageThreshold?: number,
        volumeThreshold?: number,
        priority?: AlertPriority,
        isRecurring?: boolean,
        expiresAt?: number,
        notificationMethodsList: Array<string>,
    }
}

export class UpdateAlertRequest extends jspb.Message { 
    getAlertId(): string;
    setAlertId(value: string): UpdateAlertRequest;

    hasTitle(): boolean;
    clearTitle(): void;
    getTitle(): string | undefined;
    setTitle(value: string): UpdateAlertRequest;

    hasDescription(): boolean;
    clearDescription(): void;
    getDescription(): string | undefined;
    setDescription(value: string): UpdateAlertRequest;

    getConditionsMap(): jspb.Map<string, string>;
    clearConditionsMap(): void;

    hasTargetPrice(): boolean;
    clearTargetPrice(): void;
    getTargetPrice(): number | undefined;
    setTargetPrice(value: number): UpdateAlertRequest;

    hasPercentageThreshold(): boolean;
    clearPercentageThreshold(): void;
    getPercentageThreshold(): number | undefined;
    setPercentageThreshold(value: number): UpdateAlertRequest;

    hasVolumeThreshold(): boolean;
    clearVolumeThreshold(): void;
    getVolumeThreshold(): number | undefined;
    setVolumeThreshold(value: number): UpdateAlertRequest;

    hasPriority(): boolean;
    clearPriority(): void;
    getPriority(): AlertPriority | undefined;
    setPriority(value: AlertPriority): UpdateAlertRequest;

    hasStatus(): boolean;
    clearStatus(): void;
    getStatus(): AlertStatus | undefined;
    setStatus(value: AlertStatus): UpdateAlertRequest;

    hasIsRecurring(): boolean;
    clearIsRecurring(): void;
    getIsRecurring(): boolean | undefined;
    setIsRecurring(value: boolean): UpdateAlertRequest;

    hasExpiresAt(): boolean;
    clearExpiresAt(): void;
    getExpiresAt(): number | undefined;
    setExpiresAt(value: number): UpdateAlertRequest;
    clearNotificationMethodsList(): void;
    getNotificationMethodsList(): Array<string>;
    setNotificationMethodsList(value: Array<string>): UpdateAlertRequest;
    addNotificationMethods(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateAlertRequest): UpdateAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateAlertRequest;
    static deserializeBinaryFromReader(message: UpdateAlertRequest, reader: jspb.BinaryReader): UpdateAlertRequest;
}

export namespace UpdateAlertRequest {
    export type AsObject = {
        alertId: string,
        title?: string,
        description?: string,

        conditionsMap: Array<[string, string]>,
        targetPrice?: number,
        percentageThreshold?: number,
        volumeThreshold?: number,
        priority?: AlertPriority,
        status?: AlertStatus,
        isRecurring?: boolean,
        expiresAt?: number,
        notificationMethodsList: Array<string>,
    }
}

export class DeleteAlertRequest extends jspb.Message { 
    getAlertId(): string;
    setAlertId(value: string): DeleteAlertRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DeleteAlertRequest.AsObject;
    static toObject(includeInstance: boolean, msg: DeleteAlertRequest): DeleteAlertRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DeleteAlertRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DeleteAlertRequest;
    static deserializeBinaryFromReader(message: DeleteAlertRequest, reader: jspb.BinaryReader): DeleteAlertRequest;
}

export namespace DeleteAlertRequest {
    export type AsObject = {
        alertId: string,
    }
}

export class GetUserAlertsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetUserAlertsRequest;

    hasStatus(): boolean;
    clearStatus(): void;
    getStatus(): AlertStatus | undefined;
    setStatus(value: AlertStatus): GetUserAlertsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserAlertsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserAlertsRequest): GetUserAlertsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserAlertsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserAlertsRequest;
    static deserializeBinaryFromReader(message: GetUserAlertsRequest, reader: jspb.BinaryReader): GetUserAlertsRequest;
}

export namespace GetUserAlertsRequest {
    export type AsObject = {
        userId: string,
        status?: AlertStatus,
    }
}

export class GetAlertStatisticsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetAlertStatisticsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetAlertStatisticsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetAlertStatisticsRequest): GetAlertStatisticsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetAlertStatisticsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetAlertStatisticsRequest;
    static deserializeBinaryFromReader(message: GetAlertStatisticsRequest, reader: jspb.BinaryReader): GetAlertStatisticsRequest;
}

export namespace GetAlertStatisticsRequest {
    export type AsObject = {
        userId: string,
    }
}

export class AddToWatchlistRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): AddToWatchlistRequest;
    getSymbol(): string;
    setSymbol(value: string): AddToWatchlistRequest;

    hasDisplayName(): boolean;
    clearDisplayName(): void;
    getDisplayName(): string | undefined;
    setDisplayName(value: string): AddToWatchlistRequest;

    hasNotes(): boolean;
    clearNotes(): void;
    getNotes(): string | undefined;
    setNotes(value: string): AddToWatchlistRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): AddToWatchlistRequest;
    addTags(value: string, index?: number): string;

    hasTargetBuyPrice(): boolean;
    clearTargetBuyPrice(): void;
    getTargetBuyPrice(): number | undefined;
    setTargetBuyPrice(value: number): AddToWatchlistRequest;

    hasTargetSellPrice(): boolean;
    clearTargetSellPrice(): void;
    getTargetSellPrice(): number | undefined;
    setTargetSellPrice(value: number): AddToWatchlistRequest;

    hasStopLossPrice(): boolean;
    clearStopLossPrice(): void;
    getStopLossPrice(): number | undefined;
    setStopLossPrice(value: number): AddToWatchlistRequest;

    hasEnableAlerts(): boolean;
    clearEnableAlerts(): void;
    getEnableAlerts(): boolean | undefined;
    setEnableAlerts(value: boolean): AddToWatchlistRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AddToWatchlistRequest.AsObject;
    static toObject(includeInstance: boolean, msg: AddToWatchlistRequest): AddToWatchlistRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AddToWatchlistRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AddToWatchlistRequest;
    static deserializeBinaryFromReader(message: AddToWatchlistRequest, reader: jspb.BinaryReader): AddToWatchlistRequest;
}

export namespace AddToWatchlistRequest {
    export type AsObject = {
        userId: string,
        symbol: string,
        displayName?: string,
        notes?: string,
        tagsList: Array<string>,
        targetBuyPrice?: number,
        targetSellPrice?: number,
        stopLossPrice?: number,
        enableAlerts?: boolean,
    }
}

export class RemoveFromWatchlistRequest extends jspb.Message { 
    getWatchlistItemId(): string;
    setWatchlistItemId(value: string): RemoveFromWatchlistRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RemoveFromWatchlistRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RemoveFromWatchlistRequest): RemoveFromWatchlistRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RemoveFromWatchlistRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RemoveFromWatchlistRequest;
    static deserializeBinaryFromReader(message: RemoveFromWatchlistRequest, reader: jspb.BinaryReader): RemoveFromWatchlistRequest;
}

export namespace RemoveFromWatchlistRequest {
    export type AsObject = {
        watchlistItemId: string,
    }
}

export class GetUserWatchlistRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetUserWatchlistRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetUserWatchlistRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetUserWatchlistRequest): GetUserWatchlistRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetUserWatchlistRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetUserWatchlistRequest;
    static deserializeBinaryFromReader(message: GetUserWatchlistRequest, reader: jspb.BinaryReader): GetUserWatchlistRequest;
}

export namespace GetUserWatchlistRequest {
    export type AsObject = {
        userId: string,
    }
}

export class UpdateWatchlistItemRequest extends jspb.Message { 
    getWatchlistItemId(): string;
    setWatchlistItemId(value: string): UpdateWatchlistItemRequest;

    hasDisplayName(): boolean;
    clearDisplayName(): void;
    getDisplayName(): string | undefined;
    setDisplayName(value: string): UpdateWatchlistItemRequest;

    hasNotes(): boolean;
    clearNotes(): void;
    getNotes(): string | undefined;
    setNotes(value: string): UpdateWatchlistItemRequest;
    clearTagsList(): void;
    getTagsList(): Array<string>;
    setTagsList(value: Array<string>): UpdateWatchlistItemRequest;
    addTags(value: string, index?: number): string;

    hasSortOrder(): boolean;
    clearSortOrder(): void;
    getSortOrder(): number | undefined;
    setSortOrder(value: number): UpdateWatchlistItemRequest;

    hasTargetBuyPrice(): boolean;
    clearTargetBuyPrice(): void;
    getTargetBuyPrice(): number | undefined;
    setTargetBuyPrice(value: number): UpdateWatchlistItemRequest;

    hasTargetSellPrice(): boolean;
    clearTargetSellPrice(): void;
    getTargetSellPrice(): number | undefined;
    setTargetSellPrice(value: number): UpdateWatchlistItemRequest;

    hasStopLossPrice(): boolean;
    clearStopLossPrice(): void;
    getStopLossPrice(): number | undefined;
    setStopLossPrice(value: number): UpdateWatchlistItemRequest;

    hasIsActive(): boolean;
    clearIsActive(): void;
    getIsActive(): boolean | undefined;
    setIsActive(value: boolean): UpdateWatchlistItemRequest;

    hasEnableAlerts(): boolean;
    clearEnableAlerts(): void;
    getEnableAlerts(): boolean | undefined;
    setEnableAlerts(value: boolean): UpdateWatchlistItemRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateWatchlistItemRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateWatchlistItemRequest): UpdateWatchlistItemRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateWatchlistItemRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateWatchlistItemRequest;
    static deserializeBinaryFromReader(message: UpdateWatchlistItemRequest, reader: jspb.BinaryReader): UpdateWatchlistItemRequest;
}

export namespace UpdateWatchlistItemRequest {
    export type AsObject = {
        watchlistItemId: string,
        displayName?: string,
        notes?: string,
        tagsList: Array<string>,
        sortOrder?: number,
        targetBuyPrice?: number,
        targetSellPrice?: number,
        stopLossPrice?: number,
        isActive?: boolean,
        enableAlerts?: boolean,
    }
}

export class GetWatchlistStatisticsRequest extends jspb.Message { 
    getUserId(): string;
    setUserId(value: string): GetWatchlistStatisticsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetWatchlistStatisticsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetWatchlistStatisticsRequest): GetWatchlistStatisticsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetWatchlistStatisticsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetWatchlistStatisticsRequest;
    static deserializeBinaryFromReader(message: GetWatchlistStatisticsRequest, reader: jspb.BinaryReader): GetWatchlistStatisticsRequest;
}

export namespace GetWatchlistStatisticsRequest {
    export type AsObject = {
        userId: string,
    }
}

export class SearchSymbolsRequest extends jspb.Message { 
    getQuery(): string;
    setQuery(value: string): SearchSymbolsRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SearchSymbolsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SearchSymbolsRequest): SearchSymbolsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SearchSymbolsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SearchSymbolsRequest;
    static deserializeBinaryFromReader(message: SearchSymbolsRequest, reader: jspb.BinaryReader): SearchSymbolsRequest;
}

export namespace SearchSymbolsRequest {
    export type AsObject = {
        query: string,
    }
}

export class MarketDataResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): MarketDataPoint | undefined;
    setData(value?: MarketDataPoint): MarketDataResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MarketDataResponse.AsObject;
    static toObject(includeInstance: boolean, msg: MarketDataResponse): MarketDataResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MarketDataResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MarketDataResponse;
    static deserializeBinaryFromReader(message: MarketDataResponse, reader: jspb.BinaryReader): MarketDataResponse;
}

export namespace MarketDataResponse {
    export type AsObject = {
        data?: MarketDataPoint.AsObject,
    }
}

export class BatchMarketDataResponse extends jspb.Message { 
    clearDataList(): void;
    getDataList(): Array<MarketDataPoint>;
    setDataList(value: Array<MarketDataPoint>): BatchMarketDataResponse;
    addData(value?: MarketDataPoint, index?: number): MarketDataPoint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BatchMarketDataResponse.AsObject;
    static toObject(includeInstance: boolean, msg: BatchMarketDataResponse): BatchMarketDataResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BatchMarketDataResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BatchMarketDataResponse;
    static deserializeBinaryFromReader(message: BatchMarketDataResponse, reader: jspb.BinaryReader): BatchMarketDataResponse;
}

export namespace BatchMarketDataResponse {
    export type AsObject = {
        dataList: Array<MarketDataPoint.AsObject>,
    }
}

export class HistoricalDataResponse extends jspb.Message { 
    clearDataList(): void;
    getDataList(): Array<HistoricalDataPoint>;
    setDataList(value: Array<HistoricalDataPoint>): HistoricalDataResponse;
    addData(value?: HistoricalDataPoint, index?: number): HistoricalDataPoint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HistoricalDataResponse.AsObject;
    static toObject(includeInstance: boolean, msg: HistoricalDataResponse): HistoricalDataResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HistoricalDataResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HistoricalDataResponse;
    static deserializeBinaryFromReader(message: HistoricalDataResponse, reader: jspb.BinaryReader): HistoricalDataResponse;
}

export namespace HistoricalDataResponse {
    export type AsObject = {
        dataList: Array<HistoricalDataPoint.AsObject>,
    }
}

export class OHLCDataResponse extends jspb.Message { 
    clearDataList(): void;
    getDataList(): Array<HistoricalDataPoint>;
    setDataList(value: Array<HistoricalDataPoint>): OHLCDataResponse;
    addData(value?: HistoricalDataPoint, index?: number): HistoricalDataPoint;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): OHLCDataResponse.AsObject;
    static toObject(includeInstance: boolean, msg: OHLCDataResponse): OHLCDataResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: OHLCDataResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): OHLCDataResponse;
    static deserializeBinaryFromReader(message: OHLCDataResponse, reader: jspb.BinaryReader): OHLCDataResponse;
}

export namespace OHLCDataResponse {
    export type AsObject = {
        dataList: Array<HistoricalDataPoint.AsObject>,
    }
}

export class VolumeProfileResponse extends jspb.Message { 
    clearLevelsList(): void;
    getLevelsList(): Array<VolumeProfileLevel>;
    setLevelsList(value: Array<VolumeProfileLevel>): VolumeProfileResponse;
    addLevels(value?: VolumeProfileLevel, index?: number): VolumeProfileLevel;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VolumeProfileResponse.AsObject;
    static toObject(includeInstance: boolean, msg: VolumeProfileResponse): VolumeProfileResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VolumeProfileResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VolumeProfileResponse;
    static deserializeBinaryFromReader(message: VolumeProfileResponse, reader: jspb.BinaryReader): VolumeProfileResponse;
}

export namespace VolumeProfileResponse {
    export type AsObject = {
        levelsList: Array<VolumeProfileLevel.AsObject>,
    }
}

export class RSIResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): RSI | undefined;
    setData(value?: RSI): RSIResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RSIResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RSIResponse): RSIResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RSIResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RSIResponse;
    static deserializeBinaryFromReader(message: RSIResponse, reader: jspb.BinaryReader): RSIResponse;
}

export namespace RSIResponse {
    export type AsObject = {
        data?: RSI.AsObject,
    }
}

export class MACDResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): MACD | undefined;
    setData(value?: MACD): MACDResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MACDResponse.AsObject;
    static toObject(includeInstance: boolean, msg: MACDResponse): MACDResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MACDResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MACDResponse;
    static deserializeBinaryFromReader(message: MACDResponse, reader: jspb.BinaryReader): MACDResponse;
}

export namespace MACDResponse {
    export type AsObject = {
        data?: MACD.AsObject,
    }
}

export class BollingerBandsResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): BollingerBands | undefined;
    setData(value?: BollingerBands): BollingerBandsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): BollingerBandsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: BollingerBandsResponse): BollingerBandsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: BollingerBandsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): BollingerBandsResponse;
    static deserializeBinaryFromReader(message: BollingerBandsResponse, reader: jspb.BinaryReader): BollingerBandsResponse;
}

export namespace BollingerBandsResponse {
    export type AsObject = {
        data?: BollingerBands.AsObject,
    }
}

export class MovingAverageResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): MovingAverage | undefined;
    setData(value?: MovingAverage): MovingAverageResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MovingAverageResponse.AsObject;
    static toObject(includeInstance: boolean, msg: MovingAverageResponse): MovingAverageResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MovingAverageResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MovingAverageResponse;
    static deserializeBinaryFromReader(message: MovingAverageResponse, reader: jspb.BinaryReader): MovingAverageResponse;
}

export namespace MovingAverageResponse {
    export type AsObject = {
        data?: MovingAverage.AsObject,
    }
}

export class StochasticResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): Stochastic | undefined;
    setData(value?: Stochastic): StochasticResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StochasticResponse.AsObject;
    static toObject(includeInstance: boolean, msg: StochasticResponse): StochasticResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StochasticResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StochasticResponse;
    static deserializeBinaryFromReader(message: StochasticResponse, reader: jspb.BinaryReader): StochasticResponse;
}

export namespace StochasticResponse {
    export type AsObject = {
        data?: Stochastic.AsObject,
    }
}

export class VolumeIndicatorsResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): VolumeIndicators | undefined;
    setData(value?: VolumeIndicators): VolumeIndicatorsResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VolumeIndicatorsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: VolumeIndicatorsResponse): VolumeIndicatorsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VolumeIndicatorsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VolumeIndicatorsResponse;
    static deserializeBinaryFromReader(message: VolumeIndicatorsResponse, reader: jspb.BinaryReader): VolumeIndicatorsResponse;
}

export namespace VolumeIndicatorsResponse {
    export type AsObject = {
        data?: VolumeIndicators.AsObject,
    }
}

export class ComprehensiveAnalysisResponse extends jspb.Message { 

    hasData(): boolean;
    clearData(): void;
    getData(): ComprehensiveAnalysis | undefined;
    setData(value?: ComprehensiveAnalysis): ComprehensiveAnalysisResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComprehensiveAnalysisResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ComprehensiveAnalysisResponse): ComprehensiveAnalysisResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComprehensiveAnalysisResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComprehensiveAnalysisResponse;
    static deserializeBinaryFromReader(message: ComprehensiveAnalysisResponse, reader: jspb.BinaryReader): ComprehensiveAnalysisResponse;
}

export namespace ComprehensiveAnalysisResponse {
    export type AsObject = {
        data?: ComprehensiveAnalysis.AsObject,
    }
}

export class AlertResponse extends jspb.Message { 

    hasAlert(): boolean;
    clearAlert(): void;
    getAlert(): Alert | undefined;
    setAlert(value?: Alert): AlertResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AlertResponse.AsObject;
    static toObject(includeInstance: boolean, msg: AlertResponse): AlertResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AlertResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AlertResponse;
    static deserializeBinaryFromReader(message: AlertResponse, reader: jspb.BinaryReader): AlertResponse;
}

export namespace AlertResponse {
    export type AsObject = {
        alert?: Alert.AsObject,
    }
}

export class UserAlertsResponse extends jspb.Message { 
    clearAlertsList(): void;
    getAlertsList(): Array<Alert>;
    setAlertsList(value: Array<Alert>): UserAlertsResponse;
    addAlerts(value?: Alert, index?: number): Alert;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserAlertsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserAlertsResponse): UserAlertsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserAlertsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserAlertsResponse;
    static deserializeBinaryFromReader(message: UserAlertsResponse, reader: jspb.BinaryReader): UserAlertsResponse;
}

export namespace UserAlertsResponse {
    export type AsObject = {
        alertsList: Array<Alert.AsObject>,
    }
}

export class AlertStatisticsResponse extends jspb.Message { 
    getTotal(): number;
    setTotal(value: number): AlertStatisticsResponse;
    getActive(): number;
    setActive(value: number): AlertStatisticsResponse;
    getTriggered(): number;
    setTriggered(value: number): AlertStatisticsResponse;
    getExpired(): number;
    setExpired(value: number): AlertStatisticsResponse;
    clearBySymbolList(): void;
    getBySymbolList(): Array<SymbolCount>;
    setBySymbolList(value: Array<SymbolCount>): AlertStatisticsResponse;
    addBySymbol(value?: SymbolCount, index?: number): SymbolCount;
    clearByTypeList(): void;
    getByTypeList(): Array<TypeCount>;
    setByTypeList(value: Array<TypeCount>): AlertStatisticsResponse;
    addByType(value?: TypeCount, index?: number): TypeCount;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AlertStatisticsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: AlertStatisticsResponse): AlertStatisticsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AlertStatisticsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AlertStatisticsResponse;
    static deserializeBinaryFromReader(message: AlertStatisticsResponse, reader: jspb.BinaryReader): AlertStatisticsResponse;
}

export namespace AlertStatisticsResponse {
    export type AsObject = {
        total: number,
        active: number,
        triggered: number,
        expired: number,
        bySymbolList: Array<SymbolCount.AsObject>,
        byTypeList: Array<TypeCount.AsObject>,
    }
}

export class SymbolCount extends jspb.Message { 
    getSymbol(): string;
    setSymbol(value: string): SymbolCount;
    getCount(): number;
    setCount(value: number): SymbolCount;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SymbolCount.AsObject;
    static toObject(includeInstance: boolean, msg: SymbolCount): SymbolCount.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SymbolCount, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SymbolCount;
    static deserializeBinaryFromReader(message: SymbolCount, reader: jspb.BinaryReader): SymbolCount;
}

export namespace SymbolCount {
    export type AsObject = {
        symbol: string,
        count: number,
    }
}

export class TypeCount extends jspb.Message { 
    getType(): AlertType;
    setType(value: AlertType): TypeCount;
    getCount(): number;
    setCount(value: number): TypeCount;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TypeCount.AsObject;
    static toObject(includeInstance: boolean, msg: TypeCount): TypeCount.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TypeCount, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TypeCount;
    static deserializeBinaryFromReader(message: TypeCount, reader: jspb.BinaryReader): TypeCount;
}

export namespace TypeCount {
    export type AsObject = {
        type: AlertType,
        count: number,
    }
}

export class WatchlistItemResponse extends jspb.Message { 

    hasItem(): boolean;
    clearItem(): void;
    getItem(): WatchlistItem | undefined;
    setItem(value?: WatchlistItem): WatchlistItemResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WatchlistItemResponse.AsObject;
    static toObject(includeInstance: boolean, msg: WatchlistItemResponse): WatchlistItemResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WatchlistItemResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WatchlistItemResponse;
    static deserializeBinaryFromReader(message: WatchlistItemResponse, reader: jspb.BinaryReader): WatchlistItemResponse;
}

export namespace WatchlistItemResponse {
    export type AsObject = {
        item?: WatchlistItem.AsObject,
    }
}

export class UserWatchlistResponse extends jspb.Message { 
    clearItemsList(): void;
    getItemsList(): Array<WatchlistItemWithMarketData>;
    setItemsList(value: Array<WatchlistItemWithMarketData>): UserWatchlistResponse;
    addItems(value?: WatchlistItemWithMarketData, index?: number): WatchlistItemWithMarketData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserWatchlistResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UserWatchlistResponse): UserWatchlistResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserWatchlistResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserWatchlistResponse;
    static deserializeBinaryFromReader(message: UserWatchlistResponse, reader: jspb.BinaryReader): UserWatchlistResponse;
}

export namespace UserWatchlistResponse {
    export type AsObject = {
        itemsList: Array<WatchlistItemWithMarketData.AsObject>,
    }
}

export class WatchlistStatisticsResponse extends jspb.Message { 
    getTotalSymbols(): number;
    setTotalSymbols(value: number): WatchlistStatisticsResponse;
    getActiveSymbols(): number;
    setActiveSymbols(value: number): WatchlistStatisticsResponse;
    clearSymbolsByTagsList(): void;
    getSymbolsByTagsList(): Array<TagCount>;
    setSymbolsByTagsList(value: Array<TagCount>): WatchlistStatisticsResponse;
    addSymbolsByTags(value?: TagCount, index?: number): TagCount;
    getPriceAlerts(): number;
    setPriceAlerts(value: number): WatchlistStatisticsResponse;
    clearTopGainersList(): void;
    getTopGainersList(): Array<WatchlistItemWithMarketData>;
    setTopGainersList(value: Array<WatchlistItemWithMarketData>): WatchlistStatisticsResponse;
    addTopGainers(value?: WatchlistItemWithMarketData, index?: number): WatchlistItemWithMarketData;
    clearTopLosersList(): void;
    getTopLosersList(): Array<WatchlistItemWithMarketData>;
    setTopLosersList(value: Array<WatchlistItemWithMarketData>): WatchlistStatisticsResponse;
    addTopLosers(value?: WatchlistItemWithMarketData, index?: number): WatchlistItemWithMarketData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WatchlistStatisticsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: WatchlistStatisticsResponse): WatchlistStatisticsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WatchlistStatisticsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WatchlistStatisticsResponse;
    static deserializeBinaryFromReader(message: WatchlistStatisticsResponse, reader: jspb.BinaryReader): WatchlistStatisticsResponse;
}

export namespace WatchlistStatisticsResponse {
    export type AsObject = {
        totalSymbols: number,
        activeSymbols: number,
        symbolsByTagsList: Array<TagCount.AsObject>,
        priceAlerts: number,
        topGainersList: Array<WatchlistItemWithMarketData.AsObject>,
        topLosersList: Array<WatchlistItemWithMarketData.AsObject>,
    }
}

export class TagCount extends jspb.Message { 
    getTag(): string;
    setTag(value: string): TagCount;
    getCount(): number;
    setCount(value: number): TagCount;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TagCount.AsObject;
    static toObject(includeInstance: boolean, msg: TagCount): TagCount.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TagCount, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TagCount;
    static deserializeBinaryFromReader(message: TagCount, reader: jspb.BinaryReader): TagCount;
}

export namespace TagCount {
    export type AsObject = {
        tag: string,
        count: number,
    }
}

export class SearchSymbolsResponse extends jspb.Message { 
    clearSymbolsList(): void;
    getSymbolsList(): Array<string>;
    setSymbolsList(value: Array<string>): SearchSymbolsResponse;
    addSymbols(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SearchSymbolsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SearchSymbolsResponse): SearchSymbolsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SearchSymbolsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SearchSymbolsResponse;
    static deserializeBinaryFromReader(message: SearchSymbolsResponse, reader: jspb.BinaryReader): SearchSymbolsResponse;
}

export namespace SearchSymbolsResponse {
    export type AsObject = {
        symbolsList: Array<string>,
    }
}

export enum DataSource {
    DATA_SOURCE_UNSPECIFIED = 0,
    DATA_SOURCE_ALPHA_VANTAGE = 1,
    DATA_SOURCE_IEX = 2,
    DATA_SOURCE_YAHOO_FINANCE = 3,
    DATA_SOURCE_BINANCE = 4,
    DATA_SOURCE_COINBASE = 5,
}

export enum TimeInterval {
    TIME_INTERVAL_UNSPECIFIED = 0,
    TIME_INTERVAL_ONE_MINUTE = 1,
    TIME_INTERVAL_FIVE_MINUTES = 2,
    TIME_INTERVAL_FIFTEEN_MINUTES = 3,
    TIME_INTERVAL_THIRTY_MINUTES = 4,
    TIME_INTERVAL_ONE_HOUR = 5,
    TIME_INTERVAL_FOUR_HOURS = 6,
    TIME_INTERVAL_ONE_DAY = 7,
    TIME_INTERVAL_ONE_WEEK = 8,
    TIME_INTERVAL_ONE_MONTH = 9,
}

export enum AlertType {
    ALERT_TYPE_UNSPECIFIED = 0,
    ALERT_TYPE_PRICE_ABOVE = 1,
    ALERT_TYPE_PRICE_BELOW = 2,
    ALERT_TYPE_PRICE_CHANGE = 3,
    ALERT_TYPE_VOLUME_SPIKE = 4,
    ALERT_TYPE_TECHNICAL_INDICATOR = 5,
    ALERT_TYPE_NEWS_SENTIMENT = 6,
}

export enum AlertStatus {
    ALERT_STATUS_UNSPECIFIED = 0,
    ALERT_STATUS_ACTIVE = 1,
    ALERT_STATUS_TRIGGERED = 2,
    ALERT_STATUS_DISABLED = 3,
    ALERT_STATUS_EXPIRED = 4,
}

export enum AlertPriority {
    ALERT_PRIORITY_UNSPECIFIED = 0,
    ALERT_PRIORITY_LOW = 1,
    ALERT_PRIORITY_MEDIUM = 2,
    ALERT_PRIORITY_HIGH = 3,
    ALERT_PRIORITY_CRITICAL = 4,
}
