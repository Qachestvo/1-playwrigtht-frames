import { BrowserContext, CDPSession, Page } from '@playwright/test';

/**
 * Тип для данных WebAuthn credential (PassKey)
 */
type Credential = {
    credentialId: string;
    isResidentCredential: boolean;
    rpId: string;
    privateKey: string;
    userHandle: string;
    signCount: number;
    backupEligibility: boolean;
    backupState: boolean;
};

export class WebAuthnHelper {
    private cdpSession!: CDPSession;
    private authenticatorId!: string;

    constructor(private page: Page, private context: BrowserContext) {}

    /**
     * Инициализирует виртуальный аутентификатор WebAuthn
     * - Включает CDP-сессию
     * - Создает виртуальный аутентификатор
     */
    async setup(): Promise<void> {
        this.cdpSession = await this.context.newCDPSession(this.page);
        await this.cdpSession.send('WebAuthn.enable');

        const result = await this.cdpSession.send('WebAuthn.addVirtualAuthenticator', {
            options: {
                protocol: 'ctap2',
                transport: 'internal',
                hasResidentKey: true,
                hasUserVerification: true,
                isUserVerified: true,
                automaticPresenceSimulation: false,
            },
        });

        this.authenticatorId = result.authenticatorId;
    }

    /**
     * Управление симуляцией пользовательского подтверждения
     * @param enable - Включить/выключить верификацию
     */
    async enableTouchSimulation(enable: boolean): Promise<void> {
        await this.cdpSession.send('WebAuthn.setUserVerified', {
            authenticatorId: this.authenticatorId,
            isUserVerified: enable,
        });

        await this.cdpSession.send('WebAuthn.setAutomaticPresenceSimulation', {
            authenticatorId: this.authenticatorId,
            enabled: enable,
        });
    }

    /**
     * Добавляет новый WebAuthn credential
     * @param credential - Данные учетных данных
     */
    async addCredential(credential: Credential): Promise<void> {
        await this.cdpSession.send('WebAuthn.addCredential', {
            authenticatorId: this.authenticatorId,
            credential,
        });
    }

    /**
     * Получает первый credential из аутентификатора
     * @returns Credential или null если нет сохраненных
     */
    async getFirstCredential(): Promise<Credential | null> {
        const result = await this.cdpSession.send('WebAuthn.getCredentials', {
            authenticatorId: this.authenticatorId,
        });

        if (result.credentials.length === 0) {
            return null;
        }

        console.log('🪪 Active credential:', result.credentials[0]);
        return result.credentials[0] as Credential;
    }

    /**
     * Возвращает ID аутентификатора
     */
    getAuthenticatorId(): string {
        return this.authenticatorId;
    }

    /**
     * Возвращает текущую CDP-сессию
     */
    getSession(): CDPSession {
        return this.cdpSession;
    }
}