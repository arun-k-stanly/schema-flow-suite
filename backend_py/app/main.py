from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers.health import router as health_router
from .routers.agents import router as agents_router
from .routers.pipeline import router as pipeline_router
from .routers.projects import router as projects_router
from .routers.validation import router as validation_router
from .routers.data_model import router as data_model_router
from .routers.metadata import router as metadata_router
from .routers.generator import router as generator_router
from .routers.modeling import router as modeling_router
from .routers.codegen import router as codegen_router
from .routers.deployments import router as deployments_router
from .core.db import init_db


def create_app() -> FastAPI:

    app = FastAPI(title=settings.app_name, version="0.1.0")

    # CORS
    allow_origins = settings.allowed_origins or ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize database (creates tables on first run)
    init_db(create_all=True)

    # Routers
    api_prefix = settings.api_prefix
    app.include_router(health_router, prefix=api_prefix)
    app.include_router(agents_router, prefix=api_prefix)
    app.include_router(projects_router, prefix=api_prefix)
    app.include_router(pipeline_router, prefix=api_prefix)
    app.include_router(validation_router, prefix=api_prefix)
    app.include_router(data_model_router, prefix=api_prefix)
    app.include_router(metadata_router, prefix=api_prefix)
    app.include_router(generator_router, prefix=api_prefix)
    app.include_router(modeling_router, prefix=api_prefix)
    app.include_router(codegen_router, prefix=api_prefix)
    app.include_router(deployments_router, prefix=api_prefix)

    return app


app = create_app()


