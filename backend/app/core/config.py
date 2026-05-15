from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    OPENWEATHER_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()