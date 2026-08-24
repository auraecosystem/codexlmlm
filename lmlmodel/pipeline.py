from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class LMLPipeline:
    """High-level execution interface for LML model inference."""

    def __init__(
        self,
        model: torch.nn.Module,
        tokenizer: AutoTokenizer,
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
    ):
        self.model = model
        self.tokenizer = tokenizer
        self.device = device
        self.model.to(self.device)
        self.model.eval()

    @classmethod
    def from_pretrained(
        cls,
        model_name_or_path: str,
        device: Optional[str] = None,
        torch_dtype: torch.dtype = torch.float16,
        **kwargs,
    ) -> "LMLPipeline":
        """Loads model weight checkpoints and tokenizer from local disk or Hugging Face Hub."""
        target_device = device or (
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        tokenizer = AutoTokenizer.from_pretrained(
            model_name_or_path, trust_remote_code=True
        )
        model = AutoModelForCausalLM.from_pretrained(
            model_name_or_path,
            torch_dtype=torch_dtype,
            device_map=target_device if target_device != "cpu" else None,
            trust_remote_code=True,
            **kwargs,
        )

        return cls(model=model, tokenizer=tokenizer, device=target_device)

    @torch.inference_mode()
    def generate(
        self,
        prompt: str,
        max_new_tokens: int = 128,
        temperature: float = 0.7,
        top_p: float = 0.9,
        do_sample: bool = True,
        **kwargs,
    ) -> str:
        """Generates text completion for an input prompt string."""
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

        output_ids = self.model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature if do_sample else 1.0,
            top_p=top_p if do_sample else 1.0,
            do_sample=do_sample,
            pad_token_id=self.tokenizer.eos_token_id,
            **kwargs,
        )

        # Decode newly generated tokens (slice off input prompt prefix)
        new_tokens = output_ids[0][inputs["input_ids"].shape[1] :]
        return self.tokenizer.decode(new_tokens, skip_special_tokens=True)