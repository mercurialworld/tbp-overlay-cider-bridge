from pydantic import BaseModel, alias_generators


class CiderModel(BaseModel):
    model_config = {
        "extra": "allow",
        "alias_generator": alias_generators.to_camel,
    }
